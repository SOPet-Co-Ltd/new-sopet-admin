/** Matches vendor product detail — keep in sync until shared constant lands. */
export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = 'out' | 'low' | 'ok';

export function parseStockDraft(raw: string | undefined): number | null {
  const trimmed = raw?.trim() ?? '';
  if (trimmed === '') return null;
  const next = Number(trimmed);
  if (!Number.isInteger(next) || next < 0) return null;
  return next;
}

export function stockLevel(quantity: number): StockLevel {
  if (quantity <= 0) return 'out';
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low';
  return 'ok';
}

export function stockLevelLabel(level: StockLevel): string {
  switch (level) {
    case 'out':
      return 'หมด';
    case 'low':
      return 'ใกล้หมด';
    case 'ok':
      return 'พร้อมขาย';
  }
}

export function formatStockDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}
