'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  usePlatformAnalytics,
  usePlatformSalesByCategory,
  usePlatformSalesByPayment,
  usePlatformSalesOverTime,
  usePlatformTopProducts,
  usePlatformTopStores,
} from '@/hooks/usePlatformAnalytics';
import { formatCurrency } from '@/lib/utils';

const SalesOverTimeChart = dynamic(
  () =>
    import('@/components/analytics/sales-over-time-chart').then((module) => ({
      default: module.SalesOverTimeChart,
    })),
  {
    loading: () => <p className="text-muted">กำลังโหลดข้อมูล...</p>,
  },
);

const DynamicBreakdownChart = dynamic(
  () =>
    import('@/components/analytics/breakdown-chart').then((module) => ({
      default: module.BreakdownChart,
    })),
  {
    loading: () => <p className="text-muted">กำลังโหลดข้อมูล...</p>,
  },
);

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      </CardBody>
    </Card>
  );
}

function RankedList({
  items,
}: {
  items: { key: string; primary: React.ReactNode; secondary: React.ReactNode }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">ยังไม่มีข้อมูล</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item.key}
          className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-medium text-brand">
              {index + 1}
            </span>
            <div className="min-w-0">{item.primary}</div>
          </div>
          <div className="shrink-0 text-right text-sm">{item.secondary}</div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminAnalyticsPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = usePlatformAnalytics();
  const { data: salesOverTime = [], isLoading: chartLoading } = usePlatformSalesOverTime();
  const { data: salesByPayment = [], isLoading: paymentLoading } = usePlatformSalesByPayment();
  const { data: salesByCategory = [], isLoading: categoryLoading } = usePlatformSalesByCategory();
  const { data: topProducts = [], isLoading: productsLoading } = usePlatformTopProducts(10);
  const { data: topStores = [], isLoading: storesLoading } = usePlatformTopStores(10);

  const isLoading =
    summaryLoading ||
    chartLoading ||
    paymentLoading ||
    categoryLoading ||
    productsLoading ||
    storesLoading;

  return (
    <div>
      <PageHeader
        title="ภาพรวมแพลตฟอร์ม"
        description="วิเคราะห์ยอดขาย คำสั่งซื้อ และประสิทธิภาพร้านค้าทั้งหมด"
      />

      {isLoading ? <p className="text-muted">กำลังโหลดข้อมูล...</p> : null}
      {summaryError ? (
        <p className="text-sm text-danger">
          {summaryError instanceof Error ? summaryError.message : 'โหลดข้อมูลไม่สำเร็จ'}
        </p>
      ) : null}

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="รายได้รวม" value={formatCurrency(summary.totalRevenue)} />
          <StatCard label="คำสั่งซื้อทั้งหมด" value={summary.totalOrders.toLocaleString('th-TH')} />
          <StatCard
            label="มูลค่าเฉลี่ยต่อออเดอร์"
            value={formatCurrency(summary.averageOrderValue)}
          />
          <StatCard label="ลูกค้าทั้งหมด" value={summary.totalCustomers.toLocaleString('th-TH')} />
          <StatCard
            label="ร้านค้าที่อนุมัติแล้ว"
            value={summary.totalStores.toLocaleString('th-TH')}
          />
          <StatCard
            label="ร้านค้ารออนุมัติ"
            value={summary.pendingStores.toLocaleString('th-TH')}
          />
          <StatCard
            label="ข้อพิพาทที่เปิดอยู่"
            value={summary.openDisputes.toLocaleString('th-TH')}
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ยอดขายตามเวลา (30 วันล่าสุด)</h2>
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
            <DynamicBreakdownChart data={salesByPayment} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ยอดขายตามหมวดหมู่</h2>
          </CardHeader>
          <CardBody>
            <DynamicBreakdownChart data={salesByCategory} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
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

        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ร้านค้ายอดนิยม</h2>
          </CardHeader>
          <CardBody>
            <RankedList
              items={topStores.map((store) => ({
                key: store.storeId,
                primary: (
                  <Link
                    href={`/admin/stores/${store.storeId}`}
                    className="truncate font-medium text-brand hover:text-brand-hover"
                  >
                    {store.storeName}
                  </Link>
                ),
                secondary: (
                  <>
                    <p className="text-ink">{store.orderCount} คำสั่งซื้อ</p>
                    <p className="text-muted">{formatCurrency(store.revenue)}</p>
                  </>
                ),
              }))}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
