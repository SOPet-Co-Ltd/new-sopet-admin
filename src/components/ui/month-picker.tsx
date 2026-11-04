'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { HiCalendar, HiChevronDown } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { getThaiMonthLabels } from '@/lib/datetime/calendarUtils';
import { clampYearMonth, compareYearMonth, type YearMonth } from '@/lib/analytics/summary-month';
import { cn } from '@/lib/utils';

export type MonthPickerProps = {
  id?: string;
  value: YearMonth;
  onChange: (next: YearMonth) => void;
  min?: YearMonth | null;
  max?: YearMonth | null;
  disabled?: boolean;
  className?: string;
  align?: 'start' | 'end';
  'aria-label'?: string;
};

function toBuddhistYear(year: number): number {
  return year + 543;
}

function buildYearOptions(min: YearMonth, max: YearMonth): number[] {
  const years: number[] = [];
  for (let year = max.year; year >= min.year; year -= 1) {
    years.push(year);
  }
  return years;
}

function isMonthDisabled(year: number, month: number, min: YearMonth, max: YearMonth): boolean {
  return compareYearMonth({ year, month }, min) < 0 || compareYearMonth({ year, month }, max) > 0;
}

export function MonthPicker({
  id,
  value,
  onChange,
  min = null,
  max = null,
  disabled = false,
  className,
  align = 'end',
  'aria-label': ariaLabel = 'เลือกเดือน',
}: MonthPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const panelId = `${fieldId}-panel`;

  const resolvedMax = max ?? value;
  const resolvedMin = min ?? { year: resolvedMax.year - 10, month: 1 };
  const selected = clampYearMonth(value, resolvedMin, resolvedMax);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected.year);

  const monthLabels = useMemo(() => getThaiMonthLabels(viewYear), [viewYear]);
  const yearOptions = useMemo(
    () => buildYearOptions(resolvedMin, resolvedMax),
    [resolvedMin, resolvedMax],
  );

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const displayLabel = `${monthLabels[selected.month - 1]} ${toBuddhistYear(selected.year)}`;

  const handleToggle = () => {
    if (disabled) return;
    if (!open) {
      setViewYear(selected.year);
    }
    setOpen((current) => !current);
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Button
        id={fieldId}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleToggle}
        className="h-10 min-w-[11rem] justify-between bg-white px-3 text-sm font-normal shadow-sm hover:bg-white focus-visible:border-brand focus-visible:ring-brand/20"
      >
        <span className="min-w-0 truncate">{displayLabel}</span>
        <HiCalendar className="size-4 shrink-0 text-muted" aria-hidden="true" />
      </Button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="เลือกเดือนและปี"
          className={cn(
            'absolute top-[calc(100%+0.25rem)] z-[60] w-[min(100vw-2rem,17.5rem)] rounded-xl border border-border bg-white p-3 shadow-[var(--shadow-elevated)] sm:p-4',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          <div className="mb-3">
            <label className="sr-only" htmlFor={`${fieldId}-year`}>
              ปี
            </label>
            <div className="relative">
              <select
                id={`${fieldId}-year`}
                value={viewYear}
                className="h-9 w-full appearance-none rounded-lg border border-border bg-white py-0 pl-2.5 pr-8 text-sm text-ink"
                onChange={(event) => setViewYear(Number(event.target.value))}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {toBuddhistYear(year)}
                  </option>
                ))}
              </select>
              <HiChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5" role="listbox" aria-label="เดือน">
            {monthLabels.map((label, index) => {
              const month = index + 1;
              const isSelected = selected.year === viewYear && selected.month === month;
              const isDisabled = isMonthDisabled(viewYear, month, resolvedMin, resolvedMax);

              return (
                <button
                  key={label}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={isDisabled}
                  className={cn(
                    'rounded-lg px-2 py-2.5 text-sm transition-colors',
                    isSelected
                      ? 'bg-brand text-white hover:bg-brand'
                      : 'text-ink hover:bg-brand-tint',
                    isDisabled && 'cursor-not-allowed text-muted hover:bg-transparent',
                  )}
                  onClick={() => {
                    onChange(clampYearMonth({ year: viewYear, month }, resolvedMin, resolvedMax));
                    setOpen(false);
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
