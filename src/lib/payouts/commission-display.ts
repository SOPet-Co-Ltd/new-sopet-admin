import { commissionCopy } from '@/lib/i18n/th';
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

export function commissionDeductedLabel(rate: number | null | undefined): string {
  if (rate == null) {
    return commissionCopy.breakdown.commissionDeducted;
  }
  return `${commissionCopy.breakdown.commissionDeducted} (${rate}${commissionCopy.rate.suffix})`;
}
