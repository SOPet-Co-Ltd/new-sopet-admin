'use client';

import type { SalesBreakdownItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BreakdownChartProps {
  data: SalesBreakdownItem[];
  valueKey?: 'revenue' | 'orderCount';
}

export function BreakdownChart({ data, valueKey = 'revenue' }: BreakdownChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">ยังไม่มีข้อมูล</p>;
  }

  const maxValue = Math.max(...data.map((item) => item[valueKey]), 1);

  return (
    <ul className="space-y-3">
      {data.map((item) => {
        const value = item[valueKey];
        const width = Math.max((value / maxValue) * 100, value > 0 ? 2 : 0);

        return (
          <li key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-ink">{item.label}</span>
              <span className="shrink-0 text-muted">
                {valueKey === 'revenue' ? formatCurrency(value) : `${value} คำสั่งซื้อ`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
