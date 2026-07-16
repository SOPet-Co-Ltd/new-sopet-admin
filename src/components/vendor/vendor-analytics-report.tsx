'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { HiChevronDown } from 'react-icons/hi2';
import { RankedList } from '@/components/vendor/ranked-list';
import { StatCard } from '@/components/vendor/stat-card';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import {
  type AnalyticsPeriod,
  computeStoreAnalyticsSnapshot,
  computeStoreSalesByPayment,
  computeStoreSalesOverTime,
  computeStoreTopProducts,
  getAnalyticsPeriodLabel,
} from '@/lib/orders/store-analytics';
import type { Order } from '@/types';

const SalesOverTimeChart = dynamic(
  () =>
    import('@/components/analytics/sales-over-time-chart').then((module) => ({
      default: module.SalesOverTimeChart,
    })),
  {
    loading: () => <p className="text-sm text-muted">กำลังโหลดกราฟ...</p>,
  },
);

const BreakdownChart = dynamic(
  () =>
    import('@/components/analytics/breakdown-chart').then((module) => ({
      default: module.BreakdownChart,
    })),
  {
    loading: () => <p className="text-sm text-muted">กำลังโหลดกราฟ...</p>,
  },
);

const PERIOD_OPTIONS: { id: AnalyticsPeriod; label: string }[] = [
  { id: '7d', label: 'รายสัปดาห์' },
  { id: '30d', label: 'รายเดือน' },
  { id: 'all', label: 'ทั้งหมด' },
];

export function VendorAnalyticsReport({ orders, storeId }: { orders: Order[]; storeId: string }) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  const snapshot = useMemo(
    () => computeStoreAnalyticsSnapshot(orders, storeId, period),
    [orders, period, storeId],
  );
  const salesOverTime = useMemo(
    () => computeStoreSalesOverTime(orders, storeId, period),
    [orders, period, storeId],
  );
  const salesByPayment = useMemo(
    () => computeStoreSalesByPayment(orders, storeId, period),
    [orders, period, storeId],
  );
  const topProducts = useMemo(
    () => computeStoreTopProducts(orders, storeId, period, 5),
    [orders, period, storeId],
  );

  const periodLabel = getAnalyticsPeriodLabel(period);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="min-w-0">
          <h2 className="text-lg font-medium text-ink">รายงานยอดขาย</h2>
          <p className="text-sm text-muted">กราฟและตัวเลขสำหรับวางแผน — ไม่จำเป็นต้องดูทุกครั้ง</p>
        </div>
        <HiChevronDown
          className={cn('size-5 shrink-0 text-muted transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="min-w-0 space-y-6 border-t border-border px-4 py-5 sm:px-5">
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPeriod(option.id)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  period === option.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-ink hover:bg-surface/80',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="min-w-0 space-y-3">
            <p className="text-sm text-muted">
              ช่วง {periodLabel} · ไม่รวมคำสั่งซื้อที่ยกเลิกหรือคืนเงิน
            </p>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="กำไรสุทธิ" value={formatCurrency(snapshot.netRevenue)} />
              <StatCard label="คำสั่งซื้อ" value={snapshot.orderCount.toLocaleString('th-TH')} />
              <StatCard
                label="มูลค่าเฉลี่ยต่อออเดอร์"
                value={formatCurrency(snapshot.averageOrderValue)}
              />
              <StatCard
                label="สินค้าที่ขายได้"
                value={snapshot.unitsSold.toLocaleString('th-TH')}
              />
            </div>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <Card className="min-w-0 lg:col-span-2">
              <CardHeader>
                <h3 className="font-medium text-ink">ยอดขายตามเวลา</h3>
                <p className="text-sm text-muted">กำไรสุทธิรายวัน · {periodLabel}</p>
              </CardHeader>
              <CardBody className="min-w-0">
                <SalesOverTimeChart data={salesOverTime} />
              </CardBody>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <h3 className="font-medium text-ink">ยอดขายตามช่องทางชำระเงิน</h3>
              </CardHeader>
              <CardBody>
                <BreakdownChart data={salesByPayment} />
              </CardBody>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <h3 className="font-medium text-ink">สินค้าขายดี</h3>
              </CardHeader>
              <CardBody>
                <RankedList
                  items={topProducts.map((product) => ({
                    key: product.productId,
                    primary: (
                      <p className="block min-w-0 truncate font-medium text-ink">
                        {product.productName}
                      </p>
                    ),
                    secondary: (
                      <>
                        <p className="text-ink">{product.totalSold} ชิ้น</p>
                        <p className="text-muted">{formatCurrency(product.revenue)}</p>
                      </>
                    ),
                  }))}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </section>
  );
}
