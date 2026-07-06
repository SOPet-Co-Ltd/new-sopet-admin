'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminVendors } from '@/hooks/useAdminVendors';
import { cn } from '@/lib/utils';

type VendorComboboxProps = {
  value: string;
  onChange: (id: string) => void;
  initialLabel?: string;
};

function vendorLabel(fullName: string, email: string) {
  return `${fullName} — ${email}`;
}

export function VendorCombobox({ value, onChange, initialLabel }: VendorComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(initialLabel ?? '');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (initialLabel) setSelectedLabel(initialLabel);
  }, [initialLabel]);

  const { data: vendors = [], isLoading } = useAdminVendors(debouncedQuery || undefined, {
    enabled: open,
  });

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function handleSelect(id: string, fullName: string, email: string) {
    onChange(id);
    setSelectedLabel(vendorLabel(fullName, email));
    setQuery('');
    setDebouncedQuery('');
    setOpen(false);
  }

  function handleClear() {
    onChange('');
    setSelectedLabel('');
    setQuery('');
    setDebouncedQuery('');
  }

  const displayValue = open ? query : selectedLabel || (value ? value : '');

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
          value={displayValue}
          placeholder="ค้นหาชื่อหรืออีเมลผู้ขาย..."
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="mt-1.5"
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
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-muted">กำลังค้นหา...</p>
          ) : vendors.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">ไม่พบผู้ขาย</p>
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
    </div>
  );
}
