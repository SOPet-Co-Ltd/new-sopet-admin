'use client';

import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { MonthPicker } from '@/components/ui/month-picker';
import {
  bangkokYearMonthNow,
  clampYearMonth,
  compareYearMonth,
  type YearMonth,
} from '@/lib/analytics/summary-month';

const FALLBACK_MIN: YearMonth = { year: 2000, month: 1 };

type CustomerSummaryMonthPickerProps = {
  id: string;
  year: number;
  month: number;
  onChange: (next: YearMonth) => void;
  /** Earliest selectable month (inclusive), e.g. store/customer creation month. */
  minYearMonth?: YearMonth | null;
};

export function CustomerSummaryMonthPicker({
  id,
  year,
  month,
  onChange,
  minYearMonth = null,
}: CustomerSummaryMonthPickerProps) {
  const maxYearMonth = bangkokYearMonthNow();
  const min = minYearMonth
    ? clampYearMonth(minYearMonth, FALLBACK_MIN, maxYearMonth)
    : FALLBACK_MIN;
  const selected = clampYearMonth({ year, month }, min, maxYearMonth);

  useEffect(() => {
    if (compareYearMonth({ year, month }, selected) !== 0) {
      onChange(selected);
    }
  }, [year, month, selected, onChange]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor={id}>เดือน</Label>
        <MonthPicker
          id={id}
          className="mt-1.5"
          value={selected}
          min={minYearMonth ? min : null}
          max={maxYearMonth}
          onChange={onChange}
          aria-label="เดือน"
        />
      </div>
    </div>
  );
}
