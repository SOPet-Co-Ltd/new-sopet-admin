'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { RankedList } from '@/components/vendor/ranked-list';
import { StatCard } from '@/components/vendor/stat-card';
import { cn, formatCurrency } from '@/lib/utils';
import {
  type AnalyticsPeriod,
  computeStoreAnalyticsSnapshot,
  computeStoreSalesByPayment,
  computeStoreSalesOverTime,
  computeStoreTopProducts,
  getAnalyticsPeriodLabel,
} from '@/lib/orders/store-analytics';

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

export default function VendorDashboardPage() {
  const storeId = useVendorStoreId();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const { data: operational, isLoading: operationalLoading, error } = useStoreAnalytics(storeId);
  const { data: orders = [], isLoading: ordersLoading } = useVendorOrders(storeId);

  const snapshot = useMemo(
    () => (storeId ? computeStoreAnalyticsSnapshot(orders, storeId, period) : null),
    [orders, period, storeId],
  );
  const salesOverTime = useMemo(
    () => (storeId ? computeStoreSalesOverTime(orders, storeId, period) : []),
    [orders, period, storeId],
  );
  const salesByPayment = useMemo(
    () => (storeId ? computeStoreSalesByPayment(orders, storeId, period) : []),
    [orders, period, storeId],
  );
  const topProducts = useMemo(
    () => (storeId ? computeStoreTopProducts(orders, storeId, period, 5) : []),
    [orders, period, storeId],
  );

  const isLoading = operationalLoading || ordersLoading;
  const periodLabel = getAnalyticsPeriodLabel(period);

  return (
    <div className="space-y-8">
      <PageHeader title="แดชบอร์ด" description="ภาพรวมประสิทธิภาพร้านค้าของคุณ" />

      {!storeId ? (
        <Card className="border-brand-soft bg-brand-tint/40">
          <CardBody>
            <p className="text-sm text-brand-hover">
              ไม่พบร้านค้าในเซสชัน · ข้อมูลจะแสดงหลังเข้าสู่ระบบด้วยบัญชีผู้ขายที่เชื่อมกับร้านค้า
            </p>
          </CardBody>
        </Card>
      ) : null}

      {storeId ? (
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPeriod(option.id)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                period === option.id
                  ? 'border-brand bg-brand text-white'
                  : 'border-border bg-card text-ink hover:bg-surface',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? <p className="text-muted">กำลังโหลดข้อมูล...</p> : null}
      {error ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ'}
        </p>
      ) : null}

      {snapshot ? (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="font-display text-lg font-medium text-ink">สรุปผลประกอบการ</h2>
              <p className="text-sm text-muted">
                ช่วง {periodLabel} · คำนวณจากคำสั่งซื้อของร้าน ไม่รวมคำสั่งซื้อที่ยกเลิกหรือคืนเงิน
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="กำไรสุทธิ"
                value={formatCurrency(snapshot.netRevenue)}
                hint="รายได้สินค้า + ค่าจัดส่ง - ส่วนลด (ไม่หักต้นทุนสินค้า)"
              />
              <StatCard label="รายได้สินค้า" value={formatCurrency(snapshot.grossRevenue)} />
              <StatCard label="ค่าจัดส่ง" value={formatCurrency(snapshot.shippingRevenue)} />
              <StatCard label="ส่วนลดที่ให้" value={formatCurrency(snapshot.discountAmount)} />
              <StatCard label="คำสั่งซื้อ" value={snapshot.orderCount.toLocaleString('th-TH')} />
              <StatCard
                label="สินค้าที่ขายได้"
                value={snapshot.unitsSold.toLocaleString('th-TH')}
              />
              <StatCard
                label="มูลค่าเฉลี่ยต่อออเดอร์"
                value={formatCurrency(snapshot.averageOrderValue)}
              />
              {operational ? (
                <StatCard label="สินค้าในร้าน" value={operational.totalProducts} />
              ) : null}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="font-display font-medium text-ink">ยอดขายตามเวลา</h2>
                <p className="text-sm text-muted">กำไรสุทธิรายวัน · {periodLabel}</p>
              </CardHeader>
              <CardBody>
                <SalesOverTimeChart data={salesOverTime} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-display font-medium text-ink">ยอดขายตามช่องทางชำระเงิน</h2>
              </CardHeader>
              <CardBody>
                <BreakdownChart data={salesByPayment} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-display font-medium text-ink">สินค้าขายดี</h2>
              </CardHeader>
              <CardBody>
                <RankedList
                  items={topProducts.map((product) => ({
                    key: product.productId,
                    primary: <p className="truncate font-medium text-ink">{product.productName}</p>,
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
          </section>
        </>
      ) : null}

      {operational ? (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-lg font-medium text-ink">สถานะปัจจุบัน</h2>
            <p className="text-sm text-muted">ข้อมูลปฏิบัติการ ไม่ขึ้นกับช่วงเวลาที่เลือก</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="คำสั่งซื้อทั้งหมด" value={operational.totalOrders} />
            <StatCard label="รอดำเนินการ" value={operational.pendingOrders} />
            <StatCard label="คำสั่งซื้อ 7 วันล่าสุด" value={operational.recentOrders} />
          </div>
        </section>
      ) : null}

      {!storeId && !isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="กำไรสุทธิ" value="—" />
          <StatCard label="คำสั่งซื้อ" value="—" />
          <StatCard label="สินค้าในร้าน" value="—" />
        </div>
      ) : null}
    </div>
  );
}
