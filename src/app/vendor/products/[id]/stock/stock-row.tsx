'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  formatStockDelta,
  parseStockDraft,
  stockLevel,
  stockLevelLabel,
  type StockLevel,
} from './stock-status';

const levelStyles: Record<StockLevel, string> = {
  out: 'bg-danger-bg text-danger',
  low: 'bg-warning-bg text-warning-text',
  ok: 'bg-success-bg text-success',
};

export interface StockRowProps {
  id: string;
  label: string;
  sku: string;
  originalStock: number;
  draftValue: string;
  disabled?: boolean;
  showInvalid?: boolean;
  onChange: (value: string) => void;
}

export function StockRow({
  id,
  label,
  sku,
  originalStock,
  draftValue,
  disabled = false,
  showInvalid = false,
  onChange,
}: StockRowProps) {
  const parsed = parseStockDraft(draftValue);
  const invalid = showInvalid || (draftValue.trim() !== '' && parsed === null);
  const effectiveQty = parsed ?? originalStock;
  const level = stockLevel(effectiveQty);
  const dirty = parsed !== null && parsed !== originalStock;
  const delta = dirty && parsed !== null ? parsed - originalStock : 0;

  return (
    <li
      className={cn(
        'rounded-lg border bg-card p-4 transition-colors duration-150 motion-reduce:transition-none',
        dirty ? 'border-brand/35 bg-brand-tint/30' : 'border-border',
        invalid && 'border-danger/50 bg-danger-bg/40',
      )}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(11rem,14rem)] sm:items-end">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-ink">{label}</p>
            <span
              className={cn(
                'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
                levelStyles[level],
              )}
            >
              {stockLevelLabel(level)}
            </span>
            {dirty ? (
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium tabular-nums',
                  delta > 0 ? 'text-success' : 'text-danger',
                )}
                aria-label={`เปลี่ยนแปลง ${formatStockDelta(delta)}`}
              >
                {formatStockDelta(delta)}
              </span>
            ) : null}
          </div>
          <p className="truncate text-sm text-muted-foreground">SKU: {sku}</p>
          <p className="text-sm text-muted-foreground">
            คงเหลือปัจจุบัน{' '}
            <span className="font-medium tabular-nums text-ink">{originalStock}</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`stock-${id}`}>จำนวนใหม่</Label>
          <Input
            id={`stock-${id}`}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={draftValue}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={`stock-${id}-hint`}
            className={cn(
              'tabular-nums',
              invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/25',
            )}
            onChange={(event) => onChange(event.target.value)}
          />
          <p id={`stock-${id}-hint`} className="text-xs text-muted-foreground">
            จำนวนเต็มตั้งแต่ 0 ขึ้นไป
          </p>
        </div>
      </div>
    </li>
  );
}
