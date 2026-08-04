import { parseDateInputValue } from '@/lib/datetime/calendarUtils';

export function formatThaiDate(value: string): string {
  const parts = parseDateInputValue(value);
  if (!parts) return '';

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
