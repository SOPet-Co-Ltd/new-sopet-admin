export const DEFAULT_COMMISSION_RATE_PERCENT = 7;

export function isCustomCommissionRate(rate: number | null | undefined): boolean {
  return rate != null;
}
