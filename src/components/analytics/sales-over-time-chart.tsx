'use client';

import type { SalesTimePoint } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SalesOverTimeChartProps {
  data: SalesTimePoint[];
}

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(date);
}

export function SalesOverTimeChart({ data }: SalesOverTimeChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">ยังไม่มีข้อมูลในช่วงเวลานี้</p>;
  }

  const maxRevenue = Math.max(...data.map((point) => point.revenue), 1);
  const showEveryNth = data.length > 14 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end gap-1 sm:gap-2">
        {data.map((point) => {
          const height = Math.max((point.revenue / maxRevenue) * 100, point.revenue > 0 ? 4 : 0);
          return (
            <div
              key={point.date}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${formatShortDate(point.date)}: ${formatCurrency(point.revenue)} (${point.orderCount} คำสั่งซื้อ)`}
            >
              <div
                className="w-full rounded-t-md bg-brand transition-all group-hover:bg-brand-hover"
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 sm:gap-2">
        {data.map((point, index) => (
          <div key={`${point.date}-label`} className="flex-1 text-center">
            {index % showEveryNth === 0 ? (
              <span className="text-[10px] text-muted sm:text-xs">
                {formatShortDate(point.date)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
