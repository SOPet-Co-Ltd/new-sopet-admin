import { formatCurrency } from '@/lib/utils';

export const DEFAULT_COMMISSION_RATE_PERCENT = 7;

export function isCustomCommissionRate(rate: number | null | undefined): boolean {
  return rate != null;
}

export function formatBreakdownAmount(value: number | null): string {
  if (value == null) {
    return '—';
  }
  return formatCurrency(value);
}
