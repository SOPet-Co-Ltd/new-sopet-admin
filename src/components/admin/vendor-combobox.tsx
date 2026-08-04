'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminVendors } from '@/hooks/useAdminVendors';
import { cn } from '@/lib/utils';

type VendorComboboxProps = {
  value: string;
  onChange: (id: string) => void;
  initialLabel?: string;
  fieldError?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
};

type VendorSelection = {
  id: string;
  label: string;
};

function vendorLabel(fullName: string, email: string) {
  return `${fullName} — ${email}`;
}

export function VendorCombobox({
  value,
  onChange,
  initialLabel,
  fieldError,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: VendorComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isActiveSearch, setIsActiveSearch] = useState(false);
  const [selection, setSelection] = useState<VendorSelection | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const searchParam = isActiveSearch ? debouncedSearch.trim() || undefined : undefined;

  const {
    data: vendors = [],
    isLoading,
    isFetching,
    error,
  } = useAdminVendors(searchParam, {
    enabled: open,
  });

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

  function handleSelect(id: string, fullName: string, email: string) {
    const label = vendorLabel(fullName, email);
    setSelection({ id, label });
    onChange(id);
    closeDropdown();
  }

  function handleClear() {
    setSelection(null);
    onChange('');
    closeDropdown();
  }

  function handleInputChange(next: string) {
    setInputValue(next);
    setIsActiveSearch(true);
    if (!open) setOpen(true);
    if (!next && value) {
      setSelection(null);
      onChange('');
    }
  }

  const displayValue = open ? inputValue : closedLabel;
  const isLoadingResults = isLoading || (isFetching && vendors.length === 0);

  const listboxId = 'vendor-combobox-list';

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <Input
          id="ownerId"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={ariaInvalid ?? !!fieldError}
          aria-describedby={ariaDescribedBy}
          value={displayValue}
          placeholder="ค้นหาชื่อหรืออีเมลผู้ขาย..."
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (!open) {
              setInputValue(closedLabel);
              setIsActiveSearch(false);
            }
            setOpen(true);
          }}
          className={cn(
            'mt-1.5',
            (ariaInvalid ?? !!fieldError) &&
              'border-danger focus-visible:border-danger focus-visible:ring-danger/20',
          )}
          autoComplete="off"
        />
        {value ? (
          <Button
            type="button"
            variant="outline"
            className="mt-1.5 shrink-0"
            aria-label="ล้างผู้ขายที่เลือก"
            onClick={handleClear}
          >
            ล้าง
          </Button>
        ) : null}
      </div>
      {open ? (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-white shadow-[var(--shadow-elevated)]">
          {isLoadingResults ? (
            <p className="px-3 py-2 text-sm text-muted">กำลังค้นหา...</p>
          ) : error ? (
            <p className="px-3 py-2 text-sm text-danger">
              {error instanceof Error ? error.message : 'โหลดรายชื่อผู้ขายไม่สำเร็จ'}
            </p>
          ) : vendors.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">
              {isActiveSearch ? 'ไม่พบผู้ขาย' : 'ไม่มีผู้ขายในระบบ'}
            </p>
          ) : (
            <ul id={listboxId} role="listbox">
              {vendors.map((vendor) => (
                <li key={vendor.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={vendor.id === value}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-brand-tint',
                      vendor.id === value && 'bg-brand-tint text-brand',
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(vendor.id, vendor.fullName, vendor.email)}
                  >
                    {vendorLabel(vendor.fullName, vendor.email)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      {fieldError ? (
        <p id={ariaDescribedBy} className="mt-1 text-xs text-danger" role="alert">
          {fieldError}
        </p>
      ) : null}
    </div>
  );
}
