'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import { HiOutlineFunnel, HiXMark } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { labelProductStatus } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';
import type { ProductStatus } from '@/types';

const ALL = 'all';

type TaxonomyOption = {
  id: string;
  name: string;
};

type FilterField = {
  key: string;
  label: string;
  value: string;
  options: TaxonomyOption[];
  onChange: (value: string) => void;
  triggerId: string;
};

type ActiveChip = {
  key: string;
  label: string;
  valueLabel: string;
  onClear: () => void;
};

export type ProductStatusFilter = ProductStatus | typeof ALL;

const STATUS_OPTIONS: ReadonlyArray<{ value: ProductStatusFilter; label: string }> = [
  { value: ALL, label: 'ทั้งหมด' },
  { value: 'draft', label: labelProductStatus('draft') },
  { value: 'published', label: labelProductStatus('published') },
  { value: 'archived', label: labelProductStatus('archived') },
];

type VendorProductFiltersProps = {
  status: ProductStatusFilter;
  categoryId: string;
  petTypeId: string;
  brandId: string;
  tagId: string;
  minPrice?: number;
  maxPrice?: number;
  categories: TaxonomyOption[];
  petTypes: TaxonomyOption[];
  brands: TaxonomyOption[];
  tags: TaxonomyOption[];
  onStatusChange: (value: ProductStatusFilter) => void;
  onCategoryChange: (value: string) => void;
  onPetTypeChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onPriceRangeChange: (range: { minPrice?: number; maxPrice?: number }) => void;
  disabled?: boolean;
  /** Optional leading slot (e.g. search) rendered on the same toolbar row. */
  leading?: ReactNode;
};

function formatPriceAmount(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPriceChipLabel(minPrice?: number, maxPrice?: number): string | null {
  if (minPrice != null && maxPrice != null) {
    return `${formatPriceAmount(minPrice)}–${formatPriceAmount(maxPrice)} บาท`;
  }
  if (minPrice != null) {
    return `จาก ${formatPriceAmount(minPrice)} บาท`;
  }
  if (maxPrice != null) {
    return `ไม่เกิน ${formatPriceAmount(maxPrice)} บาท`;
  }
  return null;
}

function parsePriceInput(raw: string): number | undefined {
  const trimmed = raw.trim().replace(/,/g, '');
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function priceInputDisplay(value: number | undefined): string {
  return value == null ? '' : String(value);
}

export function VendorProductFilters({
  status,
  categoryId,
  petTypeId,
  brandId,
  tagId,
  minPrice,
  maxPrice,
  categories,
  petTypes,
  brands,
  tags,
  onStatusChange,
  onCategoryChange,
  onPetTypeChange,
  onBrandChange,
  onTagChange,
  onPriceRangeChange,
  disabled = false,
  leading,
}: VendorProductFiltersProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [minPriceDraft, setMinPriceDraft] = useState(priceInputDisplay(minPrice));
  const [maxPriceDraft, setMaxPriceDraft] = useState(priceInputDisplay(maxPrice));
  const [syncedMinPrice, setSyncedMinPrice] = useState(minPrice);
  const [syncedMaxPrice, setSyncedMaxPrice] = useState(maxPrice);
  const [priceError, setPriceError] = useState<string | null>(null);

  if (minPrice !== syncedMinPrice) {
    setSyncedMinPrice(minPrice);
    setMinPriceDraft(priceInputDisplay(minPrice));
  }
  if (maxPrice !== syncedMaxPrice) {
    setSyncedMaxPrice(maxPrice);
    setMaxPriceDraft(priceInputDisplay(maxPrice));
  }

  const fields = useMemo<FilterField[]>(
    () => [
      {
        key: 'category',
        label: 'หมวดหมู่',
        value: categoryId,
        options: categories,
        onChange: onCategoryChange,
        triggerId: 'products-category-filter',
      },
      {
        key: 'petType',
        label: 'ประเภทสัตว์เลี้ยง',
        value: petTypeId,
        options: petTypes,
        onChange: onPetTypeChange,
        triggerId: 'products-pet-type-filter',
      },
      {
        key: 'brand',
        label: 'แบรนด์',
        value: brandId,
        options: brands,
        onChange: onBrandChange,
        triggerId: 'products-brand-filter',
      },
      {
        key: 'tag',
        label: 'แท็ก',
        value: tagId,
        options: tags,
        onChange: onTagChange,
        triggerId: 'products-tag-filter',
      },
    ],
    [
      brandId,
      brands,
      categories,
      categoryId,
      onBrandChange,
      onCategoryChange,
      onPetTypeChange,
      onTagChange,
      petTypeId,
      petTypes,
      tagId,
      tags,
    ],
  );

  const activeFilters = useMemo(() => {
    const chips: ActiveChip[] = [];

    if (status !== ALL) {
      chips.push({
        key: 'status',
        label: 'สถานะ',
        valueLabel: labelProductStatus(status),
        onClear: () => onStatusChange(ALL),
      });
    }

    for (const field of fields) {
      if (field.value === ALL) continue;
      chips.push({
        key: field.key,
        label: field.label,
        valueLabel: field.options.find((option) => option.id === field.value)?.name ?? field.value,
        onClear: () => field.onChange(ALL),
      });
    }

    const priceLabel = formatPriceChipLabel(minPrice, maxPrice);
    if (priceLabel) {
      chips.push({
        key: 'price',
        label: 'ราคา',
        valueLabel: priceLabel,
        onClear: () => onPriceRangeChange({ minPrice: undefined, maxPrice: undefined }),
      });
    }

    return chips;
  }, [fields, maxPrice, minPrice, onPriceRangeChange, onStatusChange, status]);

  const advancedActiveCount = useMemo(() => {
    const taxonomyCount = fields.filter((field) => field.value !== ALL).length;
    const priceCount = minPrice != null || maxPrice != null ? 1 : 0;
    return taxonomyCount + priceCount;
  }, [fields, maxPrice, minPrice]);

  const activeCount = activeFilters.length;

  const clearAll = () => {
    if (status !== ALL) onStatusChange(ALL);
    for (const field of fields) {
      if (field.value !== ALL) field.onChange(ALL);
    }
    if (minPrice != null || maxPrice != null) {
      onPriceRangeChange({ minPrice: undefined, maxPrice: undefined });
    }
    setPriceError(null);
  };

  const commitPriceRange = () => {
    const parsedMin = parsePriceInput(minPriceDraft);
    const parsedMax = parsePriceInput(maxPriceDraft);

    if (minPriceDraft.trim() && parsedMin == null) {
      setPriceError('ราคาต่ำสุดต้องเป็นตัวเลขที่ถูกต้อง');
      setMinPriceDraft(priceInputDisplay(minPrice));
      return;
    }
    if (maxPriceDraft.trim() && parsedMax == null) {
      setPriceError('ราคาสูงสุดต้องเป็นตัวเลขที่ถูกต้อง');
      setMaxPriceDraft(priceInputDisplay(maxPrice));
      return;
    }

    let nextMin = parsedMin;
    let nextMax = parsedMax;
    if (nextMin != null && nextMax != null && nextMin > nextMax) {
      [nextMin, nextMax] = [nextMax, nextMin];
    }

    setPriceError(null);
    setMinPriceDraft(priceInputDisplay(nextMin));
    setMaxPriceDraft(priceInputDisplay(nextMax));

    if (nextMin === minPrice && nextMax === maxPrice) return;
    onPriceRangeChange({ minPrice: nextMin, maxPrice: nextMax });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {leading ? <div className="min-w-0 flex-1 sm:max-w-sm">{leading}</div> : null}
        <div className={cn('flex shrink-0 items-center gap-2', !leading && 'w-full justify-end')}>
          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={disabled}
              className="text-muted"
            >
              ล้างทั้งหมด
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen((prev) => !prev)}
            disabled={disabled}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={
              advancedActiveCount > 0
                ? `ตัวกรองเพิ่มเติม ${advancedActiveCount} รายการ`
                : 'ตัวกรองเพิ่มเติม'
            }
          >
            <HiOutlineFunnel className="size-4" aria-hidden="true" />
            <span aria-hidden="true">ตัวกรอง</span>
            {advancedActiveCount > 0 ? (
              <span
                className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-primary-foreground"
                aria-hidden="true"
              >
                {advancedActiveCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <fieldset className="min-w-0" disabled={disabled}>
        <legend className="mb-1.5 block text-xs font-medium text-muted-foreground">
          สถานะสินค้า
        </legend>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = status === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => onStatusChange(option.value)}
                className="transition-[background-color,border-color,color,box-shadow] duration-150 ease-out motion-reduce:transition-none"
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </fieldset>

      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="ตัวกรองที่เลือก">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.onClear}
              disabled={disabled}
              aria-label={`ลบตัวกรอง ${filter.label}: ${filter.valueLabel}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-ink transition-colors duration-150 ease-out hover:bg-surface focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
            >
              <span className="truncate" aria-hidden="true">
                <span className="text-muted-foreground">{filter.label}: </span>
                {filter.valueLabel}
              </span>
              <HiXMark className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div
          id={panelId}
          className="rounded-xl border border-border bg-white p-4 sm:p-5"
          role="region"
          aria-label="ตัวเลือกตัวกรอง"
        >
          <div className="space-y-5">
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-ink">จัดหมวดหมู่</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  กรองตามหมวดหมู่ ประเภทสัตว์เลี้ยง แบรนด์ และแท็ก
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {fields.map((field) => (
                  <div key={field.key} className="min-w-0">
                    <label
                      htmlFor={field.triggerId}
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      {field.label}
                    </label>
                    <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                      <SelectTrigger id={field.triggerId} className="w-full">
                        <SelectValue placeholder="ทั้งหมด" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL}>ทั้งหมด</SelectItem>
                        {field.options.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t border-border" />

            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-ink">ช่วงราคา</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  กรองตามราคาขาย (บาท) — กด Enter หรือคลิกนอกช่องเพื่อใช้ตัวกรอง
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <div className="min-w-0">
                  <label
                    htmlFor="products-min-price-filter"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    ต่ำสุด
                  </label>
                  <Input
                    id="products-min-price-filter"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={minPriceDraft}
                    disabled={disabled}
                    onChange={(event) => setMinPriceDraft(event.target.value)}
                    onBlur={commitPriceRange}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitPriceRange();
                      }
                    }}
                    className="tabular-nums"
                  />
                </div>
                <span
                  className="hidden pb-2.5 text-center text-sm text-muted-foreground sm:block"
                  aria-hidden="true"
                >
                  ถึง
                </span>
                <div className="min-w-0">
                  <label
                    htmlFor="products-max-price-filter"
                    className="mb-1.5 block text-xs font-medium text-muted-foreground"
                  >
                    สูงสุด
                  </label>
                  <Input
                    id="products-max-price-filter"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="ไม่จำกัด"
                    value={maxPriceDraft}
                    disabled={disabled}
                    onChange={(event) => setMaxPriceDraft(event.target.value)}
                    onBlur={commitPriceRange}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitPriceRange();
                      }
                    }}
                    className="tabular-nums"
                  />
                </div>
              </div>
              {priceError ? (
                <p className="text-xs text-danger" role="alert">
                  {priceError}
                </p>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
