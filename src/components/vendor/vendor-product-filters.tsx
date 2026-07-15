'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import { HiOutlineFunnel, HiXMark } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

type VendorProductFiltersProps = {
  categoryId: string;
  petTypeId: string;
  brandId: string;
  tagId: string;
  categories: TaxonomyOption[];
  petTypes: TaxonomyOption[];
  brands: TaxonomyOption[];
  tags: TaxonomyOption[];
  onCategoryChange: (value: string) => void;
  onPetTypeChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onTagChange: (value: string) => void;
  disabled?: boolean;
  /** Optional leading slot (e.g. search) rendered on the same toolbar row. */
  leading?: ReactNode;
};

export function VendorProductFilters({
  categoryId,
  petTypeId,
  brandId,
  tagId,
  categories,
  petTypes,
  brands,
  tags,
  onCategoryChange,
  onPetTypeChange,
  onBrandChange,
  onTagChange,
  disabled = false,
  leading,
}: VendorProductFiltersProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

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

  const activeFilters = useMemo(
    () =>
      fields
        .filter((field) => field.value !== ALL)
        .map((field) => ({
          key: field.key,
          label: field.label,
          valueLabel:
            field.options.find((option) => option.id === field.value)?.name ?? field.value,
          onClear: () => field.onChange(ALL),
        })),
    [fields],
  );

  const activeCount = activeFilters.length;

  const clearAll = () => {
    for (const field of fields) {
      if (field.value !== ALL) {
        field.onChange(ALL);
      }
    }
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
            aria-label={activeCount > 0 ? `ตัวกรอง ${activeCount} รายการ` : 'ตัวกรอง'}
          >
            <HiOutlineFunnel className="size-4" aria-hidden="true" />
            <span aria-hidden="true">ตัวกรอง</span>
            {activeCount > 0 ? (
              <span
                className="inline-flex min-w-5 items-center justify-center rounded-md bg-brand-tint px-1.5 text-xs font-semibold text-brand"
                aria-hidden="true"
              >
                {activeCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {activeCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="ตัวกรองที่เลือก">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={filter.onClear}
              disabled={disabled}
              aria-label={`ลบตัวกรอง ${filter.label}: ${filter.valueLabel}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-brand/40 hover:bg-brand-tint disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="truncate" aria-hidden="true">
                <span className="text-muted">{filter.label}: </span>
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
          className="rounded-xl border border-border bg-surface/60 p-4 sm:p-5"
          role="region"
          aria-label="ตัวเลือกตัวกรอง"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {fields.map((field) => (
              <div key={field.key} className="min-w-0">
                <label
                  htmlFor={field.triggerId}
                  className="mb-1.5 block text-xs font-medium text-muted"
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
        </div>
      ) : null}
    </div>
  );
}
