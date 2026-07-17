'use client';

import type { SalesTimePoint } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SalesOverTimeChartProps {
  data: SalesTimePoint[];
}

/** Min width per day so Thai short dates (e.g. "15 มิ.ย.") don't collide when scrolling. */
const DAY_SLOT_PX = 20;

function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' }).format(date);
}

export function SalesOverTimeChart({ data }: SalesOverTimeChartProps) {
  const totalRevenue = data.reduce((sum, point) => sum + point.revenue, 0);

  if (data.length === 0 || totalRevenue === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        ยังไม่มียอดขายในช่วง 30 วันล่าสุด — ข้อมูลจะปรากฏเมื่อมีคำสั่งซื้อที่สำเร็จ
      </p>
    );
  }

  const maxRevenue = Math.max(...data.map((point) => point.revenue), 1);
  const showEveryNth = data.length > 14 ? Math.ceil(data.length / 7) : 1;
  const chartMinWidth = Math.max(data.length * DAY_SLOT_PX, 280);

  return (
    <div
      className="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]"
      role="region"
      aria-label="กราฟยอดขายตามเวลา"
      tabIndex={0}
    >
      <div className="space-y-3" style={{ minWidth: chartMinWidth }}>
        <div className="flex h-48 items-stretch gap-px sm:gap-1">
          {data.map((point) => {
            const height = Math.max((point.revenue / maxRevenue) * 100, point.revenue > 0 ? 4 : 0);
            return (
              <div
                key={point.date}
                className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                title={`${formatShortDate(point.date)}: ${formatCurrency(point.revenue)} (${point.orderCount} คำสั่งซื้อ)`}
              >
                <div
                  className="w-full rounded-t-md bg-tertiary transition-colors motion-reduce:transition-none group-hover:bg-tertiary-hover"
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="relative flex h-4 gap-px sm:h-5 sm:gap-1">
          {data.map((point, index) => (
            <div key={`${point.date}-label`} className="relative min-w-0 flex-1">
              {index % showEveryNth === 0 ? (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground">
                  {formatShortDate(point.date)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
