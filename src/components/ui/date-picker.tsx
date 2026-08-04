'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { HiCalendar, HiChevronDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  getCalendarDays,
  getThaiMonthLabels,
  getYearRange,
  isDateInRange,
  parseDateInputValue,
  THAI_WEEKDAY_LABELS,
} from '@/lib/datetime/calendarUtils';
import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';
import { cn } from '@/lib/utils';

export type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'data-testid'?: string;
};

function getDisplayValue(value: string, placeholder: string): string {
  if (!value.trim()) return placeholder;
  return formatThaiDate(value);
}

function clampViewMonth(year: number, month: number, min?: string, max?: string) {
  const minParts = min ? parseDateInputValue(min) : null;
  const maxParts = max ? parseDateInputValue(max) : null;

  let nextYear = year;
  let nextMonth = month;

  if (
    minParts &&
    (nextYear < minParts.year || (nextYear === minParts.year && nextMonth < minParts.month))
  ) {
    nextYear = minParts.year;
    nextMonth = minParts.month;
  }

  if (
    maxParts &&
    (nextYear > maxParts.year || (nextYear === maxParts.year && nextMonth > maxParts.month))
  ) {
    nextYear = maxParts.year;
    nextMonth = maxParts.month;
  }

  return { year: nextYear, month: nextMonth };
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'เลือกวันที่',
  min,
  max,
  disabled = false,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'data-testid': dataTestId,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const parsedValue = parseDateInputValue(value);
  const todayParts = parseDateInputValue(max ?? new Date().toISOString().slice(0, 10));
  const initialView = parsedValue ??
    todayParts ?? { year: new Date().getUTCFullYear(), month: 1, day: 1 };

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);

  const monthLabels = useMemo(() => getThaiMonthLabels(viewYear), [viewYear]);
  const yearOptions = useMemo(() => getYearRange(min, max), [min, max]);
  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const closePanel = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closePanel();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePanel, open]);

  const setView = (year: number, month: number) => {
    const clamped = clampViewMonth(year, month, min, max);
    setViewYear(clamped.year);
    setViewMonth(clamped.month);
  };

  const handlePreviousMonth = () => {
    if (viewMonth === 1) {
      setView(viewYear - 1, 12);
      return;
    }
    setView(viewYear, viewMonth - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setView(viewYear + 1, 1);
      return;
    }
    setView(viewYear, viewMonth + 1);
  };

  const hasValue = Boolean(value.trim());
  const calendarId = `${fieldId}-calendar`;

  const handleToggle = () => {
    if (disabled) return;
    if (!open && parsedValue) {
      const clamped = clampViewMonth(parsedValue.year, parsedValue.month, min, max);
      setViewYear(clamped.year);
      setViewMonth(clamped.month);
    }
    setOpen((current) => !current);
  };

  return (
    <div ref={rootRef} className={cn('relative w-full', className)} data-testid={dataTestId}>
      <Button
        id={fieldId}
        type="button"
        variant="outline"
        disabled={disabled}
        data-testid={dataTestId ? `${dataTestId}-trigger` : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={calendarId}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onClick={handleToggle}
        className={cn(
          'h-10 w-full justify-between px-3 font-normal',
          !hasValue && 'text-muted',
          ariaInvalid && 'border-danger ring-1 ring-danger/30',
        )}
      >
        <span className="min-w-0 truncate">{getDisplayValue(value, placeholder)}</span>
        <HiCalendar className="size-4 shrink-0 text-muted" aria-hidden="true" />
      </Button>

      {open ? (
        <div
          id={calendarId}
          role="dialog"
          aria-label="เลือกวันที่"
          className="absolute left-0 top-[calc(100%+0.25rem)] z-[60] w-[min(100vw-2rem,17.5rem)] rounded-xl border border-border bg-white p-3 shadow-[var(--shadow-elevated)] sm:p-4"
        >
          <div className="mb-3 flex items-center gap-1 sm:mb-4 sm:gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="เดือนก่อนหน้า"
              className="size-8 shrink-0"
              onClick={handlePreviousMonth}
            >
              <HiChevronLeft className="size-4" aria-hidden="true" />
            </Button>

            <div className="grid min-w-0 flex-1 grid-cols-2 gap-1 sm:gap-2">
              <label className="sr-only" htmlFor={`${fieldId}-month`}>
                เดือน
              </label>
              <div className="relative min-w-0">
                <select
                  id={`${fieldId}-month`}
                  value={viewMonth}
                  className="h-8 w-full appearance-none truncate rounded-lg border border-border bg-white py-0 pl-2 pr-7 text-xs text-ink sm:h-9 sm:pl-2.5 sm:text-sm"
                  onChange={(event) => setView(viewYear, Number(event.target.value))}
                >
                  {monthLabels.map((label, index) => (
                    <option key={label} value={index + 1}>
                      {label}
                    </option>
                  ))}
                </select>
                <HiChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted"
                />
              </div>

              <label className="sr-only" htmlFor={`${fieldId}-year`}>
                ปี
              </label>
              <div className="relative min-w-0">
                <select
                  id={`${fieldId}-year`}
                  value={viewYear}
                  className="h-8 w-full appearance-none rounded-lg border border-border bg-white py-0 pl-2 pr-7 text-xs text-ink sm:h-9 sm:pl-2.5 sm:text-sm"
                  onChange={(event) => setView(Number(event.target.value), viewMonth)}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year + 543}
                    </option>
                  ))}
                </select>
                <HiChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-muted"
                />
              </div>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="เดือนถัดไป"
              className="size-8 shrink-0"
              onClick={handleNextMonth}
            >
              <HiChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mb-1.5 grid grid-cols-7 gap-0.5 sm:mb-2 sm:gap-1" aria-hidden="true">
            {THAI_WEEKDAY_LABELS.map((label) => (
              <span key={label} className="py-1 text-center text-xs font-medium text-muted">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1" role="grid" aria-label="ปฏิทิน">
            {calendarDays.map((cell, index) => {
              if (!cell.date || cell.day === null) {
                return <span key={`empty-${index}`} className="h-8 sm:h-9" aria-hidden="true" />;
              }

              const isSelected = cell.date === value;
              const isDisabled = !isDateInRange(cell.date, min, max);

              return (
                <button
                  key={cell.date}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={String(cell.day)}
                  disabled={isDisabled}
                  className={cn(
                    'flex h-8 items-center justify-center rounded-full text-xs transition-colors sm:h-9 sm:text-sm',
                    isSelected
                      ? 'bg-brand text-white hover:bg-brand'
                      : 'text-ink hover:bg-brand-tint',
                    isDisabled && 'cursor-not-allowed text-muted hover:bg-transparent',
                  )}
                  onClick={() => {
                    onChange(cell.date ?? '');
                    closePanel();
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {hasValue ? (
            <div className="mt-3 flex justify-end border-t border-border pt-2.5 sm:mt-4 sm:pt-3">
              <button
                type="button"
                className="text-xs font-medium text-brand hover:text-brand-hover"
                onClick={() => {
                  onChange('');
                  closePanel();
                }}
              >
                ล้างวันที่
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
