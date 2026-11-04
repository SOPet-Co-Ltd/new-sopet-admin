/** Bangkok calendar helpers for admin customer/store summary month pickers. */

export type YearMonth = { year: number; month: number };

export function bangkokYearMonthNow(now: Date = new Date()): YearMonth {
  return bangkokYearMonthFromDate(now);
}

export function bangkokYearMonthFromDate(date: Date | string): YearMonth {
  const value = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(value);

  return {
    year: Number(parts.find((p) => p.type === 'year')?.value),
    month: Number(parts.find((p) => p.type === 'month')?.value),
  };
}

export function toMonthInputValue(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function parseMonthInputValue(value: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

export function compareYearMonth(a: YearMonth, b: YearMonth): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

export function clampYearMonth(value: YearMonth, min: YearMonth, max: YearMonth): YearMonth {
  if (compareYearMonth(value, min) < 0) return min;
  if (compareYearMonth(value, max) > 0) return max;
  return value;
}

export function formatSummaryMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatOptionalNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString('th-TH', options);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${(value * 100).toLocaleString('th-TH', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })}%`;
}

/** e.g. "2 เดือน 16 วันมาแล้ว", "5 วันมาแล้ว", "เพิ่งสั่งซื้อ" */
export function formatTimeSinceLastOrder(
  months: number | null | undefined,
  days: number | null | undefined,
): string {
  if (months == null || days == null) return '—';
  if (months === 0 && days === 0) return 'เพิ่งสั่งซื้อ';
  const parts: string[] = [];
  if (months > 0) parts.push(`${months.toLocaleString('th-TH')} เดือน`);
  if (days > 0) parts.push(`${days.toLocaleString('th-TH')} วัน`);
  if (parts.length === 0) return 'เพิ่งสั่งซื้อ';
  return `${parts.join(' ')}มาแล้ว`;
}
