'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

const THAI_WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as const;

export type DateTimePickerMode = 'date' | 'datetime';

export interface DateTimePickerProps {
  id?: string;
  mode?: DateTimePickerMode;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  placeholder?: string;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function parseDateValue(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function parseTimeValue(value: string): { hour: number; minute: number } {
  const match = /T(\d{2}):(\d{2})/.exec(value);
  if (!match) return { hour: 0, minute: 0 };
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function buildValue(
  date: { year: number; month: number; day: number },
  time: { hour: number; minute: number },
  mode: DateTimePickerMode,
): string {
  const datePart = `${date.year}-${pad2(date.month)}-${pad2(date.day)}`;
  if (mode === 'date') return datePart;
  return `${datePart}T${pad2(time.hour)}:${pad2(time.minute)}`;
}

function formatDisplay(value: string, mode: DateTimePickerMode): string {
  const date = parseDateValue(value);
  if (!date) return '';

  const displayDate = new Date(date.year, date.month - 1, date.day).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (mode === 'date') return displayDate;

  const { hour, minute } = parseTimeValue(value);
  return `${displayDate} ${pad2(hour)}:${pad2(minute)} น.`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const cells: Array<number | null> = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function DateTimePicker({
  id,
  mode = 'date',
  value,
  onChange,
  disabled = false,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  placeholder,
}: DateTimePickerProps) {
  const generatedId = useId();
  const pickerId = id ?? generatedId;
  const listboxId = `${pickerId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const parsed = parseDateValue(value);
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth() + 1);

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  const selectedDay = parsed?.day ?? null;
  const time = parseTimeValue(value);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function emitChange(year: number, month: number, day: number, hour: number, minute: number) {
    onChange(buildValue({ year, month, day }, { hour, minute }, mode));
  }

  function selectDay(day: number) {
    emitChange(viewYear, viewMonth, day, time.hour, time.minute);
    if (mode === 'date') setOpen(false);
  }

  function shiftMonth(delta: number) {
    const date = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth() + 1);
  }

  const cells = getCalendarCells(viewYear, viewMonth);
  const display = formatDisplay(value, mode);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button
        id={pickerId}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn('h-10 w-full justify-start px-3 font-normal', !display && 'text-muted')}
        onClick={() => setOpen((prev) => !prev)}
      >
        {display || placeholder || (mode === 'date' ? 'เลือกวันที่' : 'เลือกวันและเวลา')}
      </Button>

      {open ? (
        <div
          id={listboxId}
          role="dialog"
          aria-label={mode === 'date' ? 'เลือกวันที่' : 'เลือกวันและเวลา'}
          className="absolute left-0 top-[calc(100%+0.25rem)] z-[60] w-[min(100vw-2rem,20rem)] rounded-xl border border-border bg-white p-3 shadow-[var(--shadow-elevated)]"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="เดือนก่อนหน้า"
              onClick={() => shiftMonth(-1)}
            >
              ‹
            </Button>
            <p className="text-sm font-medium text-ink">
              {THAI_MONTHS[viewMonth - 1]} {viewYear + 543}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-label="เดือนถัดไป"
              onClick={() => shiftMonth(1)}
            >
              ›
            </Button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {THAI_WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) =>
              day === null ? (
                <span key={`empty-${index}`} aria-hidden />
              ) : (
                <button
                  key={`${viewYear}-${viewMonth}-${day}`}
                  type="button"
                  className={cn(
                    'h-8 rounded-md text-sm transition-colors hover:bg-brand-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                    selectedDay === day && 'bg-brand text-white hover:bg-brand',
                  )}
                  aria-label={`${day} ${THAI_MONTHS[viewMonth - 1]} ${viewYear + 543}`}
                  aria-pressed={selectedDay === day}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              ),
            )}
          </div>

          {mode === 'datetime' ? (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <div>
                <label htmlFor={`${pickerId}-hour`} className="mb-1 block text-xs text-muted">
                  ชั่วโมง
                </label>
                <Input
                  id={`${pickerId}-hour`}
                  type="number"
                  min={0}
                  max={23}
                  value={pad2(time.hour)}
                  onChange={(event) => {
                    const hour = Math.min(23, Math.max(0, Number(event.target.value) || 0));
                    const day = selectedDay ?? 1;
                    emitChange(viewYear, viewMonth, day, hour, time.minute);
                  }}
                />
              </div>
              <div>
                <label htmlFor={`${pickerId}-minute`} className="mb-1 block text-xs text-muted">
                  นาที
                </label>
                <Input
                  id={`${pickerId}-minute`}
                  type="number"
                  min={0}
                  max={59}
                  value={pad2(time.minute)}
                  onChange={(event) => {
                    const minute = Math.min(59, Math.max(0, Number(event.target.value) || 0));
                    const day = selectedDay ?? 1;
                    emitChange(viewYear, viewMonth, day, time.hour, minute);
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onChange('')}>
              ล้าง
            </Button>
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              เสร็จสิ้น
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
