'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlatformProducts, useVendorProducts } from '@/hooks/useVendorProducts';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

export type BxGyProductPickerProps = {
  scope: 'platform' | 'store';
  value: string;
  onChange: (productId: string, label: string) => void;
  initialLabel?: string;
  error?: string;
  idPrefix?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

type ProductSelection = {
  id: string;
  label: string;
};

/** Client-filter picker results to published when status is present (Design Doc I003). */
export function filterPublishedProducts(products: Product[]): Product[] {
  return products.filter((product) => {
    if (product.status == null || product.status === '') return true;
    return product.status === 'published';
  });
}

function createPickerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });
}

export function BxGyProductPicker(props: BxGyProductPickerProps) {
  const [queryClient] = useState(createPickerQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <BxGyProductPickerInner {...props} />
    </QueryClientProvider>
  );
}

function BxGyProductPickerInner({
  scope,
  value,
  onChange,
  initialLabel,
  error,
  idPrefix = 'promo',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: BxGyProductPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isActiveSearch, setIsActiveSearch] = useState(false);
  const [selection, setSelection] = useState<ProductSelection | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const searchParam = isActiveSearch ? debouncedSearch.trim() || undefined : undefined;
  const listParams = { search: searchParam, page: 1, limit: 20 };
  const fetchEnabled = open;

  const vendorQuery = useVendorProducts(listParams, {
    enabled: scope === 'store' && fetchEnabled,
  });
  const platformQuery = usePlatformProducts(listParams, {
    enabled: scope === 'platform' && fetchEnabled,
  });

  const activeQuery = scope === 'platform' ? platformQuery : vendorQuery;
  const { data, isLoading, isFetching, error: fetchError, refetch } = activeQuery;

  // retryKey bumps on Retry so tests can assert remount intent; refetch drives recovery
  void retryKey;

  const products = useMemo(() => filterPublishedProducts(data?.items ?? []), [data?.items]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setInputValue('');
    setDebouncedSearch('');
    setIsActiveSearch(false);
  }, []);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [closeDropdown]);

  const closedLabel = !value
    ? ''
    : selection?.id === value
      ? selection.label
      : (initialLabel ?? value);

  function handleSelect(id: string, name: string) {
    setSelection({ id, label: name });
    onChange(id, name);
    closeDropdown();
  }

  function handleClear() {
    setSelection(null);
    onChange('', '');
    closeDropdown();
  }

  function handleInputChange(next: string) {
    setInputValue(next);
    setIsActiveSearch(true);
    if (!open) setOpen(true);
    if (!next && value) {
      setSelection(null);
      onChange('', '');
    }
  }

  function handleRetry() {
    setRetryKey((k) => k + 1);
    void refetch();
  }

  const displayValue = open ? inputValue : closedLabel;
  const isLoadingResults = isLoading || (isFetching && products.length === 0);

  const inputId = `${idPrefix}-bxgy-product`;
  const listboxId = `${idPrefix}-bxgy-product-list`;
  const hintId = `${idPrefix}-bxgy-product-hint`;
  const errorId = `${idPrefix}-bxgy-product-error`;
  const describedBy =
    [ariaDescribedBy, error ? errorId : undefined, !error ? hintId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  const placeholder =
    scope === 'platform' ? 'ค้นหาสินค้าจากแคตตาล็อกแพลตฟอร์ม' : 'ค้นหาชื่อสินค้าในร้าน';

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor={inputId} required>
        สินค้าที่ใช้โปรโมชัน (บังคับ)
      </Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={ariaInvalid ?? !!error}
          aria-describedby={describedBy}
          value={displayValue}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (!open) {
              setInputValue(closedLabel);
              setIsActiveSearch(false);
            }
            setOpen(true);
          }}
          className={cn(
            (ariaInvalid ?? !!error) &&
              'border-danger focus-visible:border-danger focus-visible:ring-danger/20',
          )}
          autoComplete="off"
        />
        {value ? (
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            aria-label="ล้างสินค้าที่เลือก"
            onClick={handleClear}
          >
            ล้าง
          </Button>
        ) : null}
      </div>
      {!error ? (
        <p id={hintId} className="mt-1 text-xs text-muted-foreground">
          ทุกตัวเลือก (variant) ของสินค้านี้นับรวมจำนวนในตะกร้า
        </p>
      ) : null}
      {open ? (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-white shadow-[var(--shadow-elevated)]">
          {isLoadingResults ? (
            <p className="px-3 py-2 text-sm text-muted" role="status">
              กำลังค้นหา...
            </p>
          ) : fetchError ? (
            <div className="space-y-2 px-3 py-2">
              <p className="text-sm text-danger">
                {fetchError instanceof Error ? fetchError.message : 'โหลดรายการสินค้าไม่สำเร็จ'}
              </p>
              <Button type="button" size="sm" variant="outline" onClick={handleRetry}>
                ลองอีกครั้ง
              </Button>
            </div>
          ) : products.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">ไม่พบสินค้าที่ตรงกับคำค้น</p>
          ) : (
            <ul id={listboxId} role="listbox">
              {products.map((product) => (
                <li key={product.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={product.id === value}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-brand-tint',
                      product.id === value && 'bg-brand-tint text-brand',
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(product.id, product.name)}
                  >
                    {product.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
