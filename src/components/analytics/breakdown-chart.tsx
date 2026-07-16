'use client';

import type { SalesBreakdownItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BreakdownChartProps {
  data: SalesBreakdownItem[];
  valueKey?: 'revenue' | 'orderCount';
}

export function BreakdownChart({ data, valueKey = 'revenue' }: BreakdownChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        ยังไม่มีข้อมูลในหมวดนี้ — ข้อมูลจะปรากฏเมื่อมีคำสั่งซื้อที่สำเร็จ
      </p>
    );
  }

  const maxValue = Math.max(...data.map((item) => item[valueKey]), 1);

  return (
    <ul className="space-y-3">
      {data.map((item) => {
        const value = item[valueKey];
        const width = Math.max((value / maxValue) * 100, value > 0 ? 2 : 0);

        return (
          <li key={item.label}>
            <div className="mb-1 flex min-w-0 items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium text-ink">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {valueKey === 'revenue' ? formatCurrency(value) : `${value} คำสั่งซื้อ`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-secondary transition-[width] duration-200 motion-reduce:transition-none"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
