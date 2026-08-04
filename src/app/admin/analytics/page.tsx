'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { AnalyticsPanel } from '@/components/analytics/analytics-panel';
import {
  BreakdownChartSkeleton,
  SalesOverTimeChartSkeleton,
} from '@/components/analytics/analytics-chart-skeleton';
import { PlatformRankedList } from '@/components/analytics/platform-ranked-list';
import {
  PlatformStatCard,
  PlatformStatGridSkeleton,
} from '@/components/analytics/platform-stat-card';
import { PageHeader } from '@/components/ui/card';
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
    loading: () => <SalesOverTimeChartSkeleton />,
  },
);

const DynamicBreakdownChart = dynamic(
  () =>
    import('@/components/analytics/breakdown-chart').then((module) => ({
      default: module.BreakdownChart,
    })),
  {
    loading: () => <BreakdownChartSkeleton />,
  },
);

export default function AdminAnalyticsPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = usePlatformAnalytics();
  const {
    data: salesOverTime = [],
    isLoading: chartLoading,
    error: chartError,
  } = usePlatformSalesOverTime();
  const {
    data: salesByPayment = [],
    isLoading: paymentLoading,
    error: paymentError,
  } = usePlatformSalesByPayment();
  const {
    data: salesByCategory = [],
    isLoading: categoryLoading,
    error: categoryError,
  } = usePlatformSalesByCategory();
  const {
    data: topProducts = [],
    isLoading: productsLoading,
    error: productsError,
  } = usePlatformTopProducts(10);
  const {
    data: topStores = [],
    isLoading: storesLoading,
    error: storesError,
  } = usePlatformTopStores(10);

  return (
    <div className="min-w-0 space-y-10">
      <PageHeader
        title="ภาพรวมแพลตฟอร์ม"
        description="ตัวเลขยอดขาย คำสั่งซื้อ และประสิทธิภาพร้านค้า — อัปเดตทุก 30 วินาที"
      />

      {summaryError ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          {summaryError instanceof Error ? summaryError.message : 'โหลดข้อมูลสรุปไม่สำเร็จ'}
        </p>
      ) : null}

      <section aria-labelledby="commerce-metrics-heading" className="min-w-0">
        <div className="mb-4">
          <h2 id="commerce-metrics-heading" className="text-lg font-medium text-ink">
            ยอดขายและลูกค้า
          </h2>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            ข้อมูลสะสมทั้งแพลตฟอร์ม · ไม่รวมคำสั่งซื้อที่ยกเลิกหรือคืนเงิน
          </p>
        </div>

        {summaryLoading ? (
          <PlatformStatGridSkeleton count={4} />
        ) : summary ? (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PlatformStatCard label="รายได้รวม" value={formatCurrency(summary.totalRevenue)} />
            <PlatformStatCard
              label="คำสั่งซื้อทั้งหมด"
              value={summary.totalOrders.toLocaleString('th-TH')}
            />
            <PlatformStatCard
              label="มูลค่าเฉลี่ยต่อออเดอร์"
              value={formatCurrency(summary.averageOrderValue)}
            />
            <PlatformStatCard
              label="ลูกค้าทั้งหมด"
              value={summary.totalCustomers.toLocaleString('th-TH')}
            />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="store-metrics-heading" className="min-w-0">
        <div className="mb-4">
          <h2 id="store-metrics-heading" className="text-lg font-medium text-ink">
            ร้านค้าในแพลตฟอร์ม
          </h2>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            สถานะร้านค้าที่ลงทะเบียน — คลิกเพื่อดูรายละเอียดหรือจัดการคำขอ
          </p>
        </div>

        {summaryLoading ? (
          <PlatformStatGridSkeleton count={2} />
        ) : summary ? (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <PlatformStatCard
              label="ร้านค้าที่อนุมัติแล้ว"
              value={summary.totalStores.toLocaleString('th-TH')}
              hint="ดูรายการร้านค้าทั้งหมด"
              href="/admin/stores"
            />
            <PlatformStatCard
              label="ร้านค้ารออนุมัติ"
              value={summary.pendingStores.toLocaleString('th-TH')}
              hint="ไปที่ศูนย์คำขอเพื่ออนุมัติ"
              href="/admin/requests"
            />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="trends-heading" className="min-w-0 space-y-6">
        <div>
          <h2 id="trends-heading" className="text-lg font-medium text-ink">
            แนวโน้มและการแบ่งสัดส่วน
          </h2>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            30 วันล่าสุด · เลื่อนกราฟแนวนอนได้บนหน้าจอเล็ก
          </p>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <AnalyticsPanel
            className="lg:col-span-2"
            title="ยอดขายตามเวลา"
            description="รายได้รายวันจากคำสั่งซื้อที่สำเร็จ"
            loading={chartLoading}
            error={chartError}
            loadingFallback={<SalesOverTimeChartSkeleton />}
          >
            <SalesOverTimeChart data={salesOverTime} />
          </AnalyticsPanel>

          <AnalyticsPanel
            title="ยอดขายตามช่องทางชำระเงิน"
            loading={paymentLoading}
            error={paymentError}
            loadingFallback={<BreakdownChartSkeleton />}
          >
            <DynamicBreakdownChart data={salesByPayment} />
          </AnalyticsPanel>

          <AnalyticsPanel
            title="ยอดขายตามหมวดหมู่"
            loading={categoryLoading}
            error={categoryError}
            loadingFallback={<BreakdownChartSkeleton />}
          >
            <DynamicBreakdownChart data={salesByCategory} />
          </AnalyticsPanel>
        </div>
      </section>

      <section aria-labelledby="rankings-heading" className="min-w-0 space-y-6">
        <div>
          <h2 id="rankings-heading" className="text-lg font-medium text-ink">
            อันดับยอดนิยม
          </h2>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            10 อันดับแรกจากยอดขายสะสม
          </p>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <AnalyticsPanel
            title="สินค้าขายดี"
            loading={productsLoading}
            error={productsError}
            loadingFallback={<PlatformRankedList loading items={[]} />}
          >
            <PlatformRankedList
              items={topProducts.map((product) => ({
                key: product.productId,
                primary: (
                  <p className="block min-w-0 truncate font-medium text-ink">
                    {product.productName}
                  </p>
                ),
                secondary: (
                  <>
                    <p className="tabular-nums text-ink">
                      {product.totalSold.toLocaleString('th-TH')} ชิ้น
                    </p>
                    <p className="tabular-nums text-muted-foreground">
                      {formatCurrency(product.revenue)}
                    </p>
                  </>
                ),
              }))}
            />
          </AnalyticsPanel>

          <AnalyticsPanel
            title="ร้านค้ายอดนิยม"
            loading={storesLoading}
            error={storesError}
            loadingFallback={<PlatformRankedList loading items={[]} />}
          >
            <PlatformRankedList
              items={topStores.map((store) => ({
                key: store.storeId,
                primary: (
                  <Link
                    href={`/admin/stores/${store.storeId}`}
                    className="block min-w-0 truncate font-medium text-secondary transition-colors hover:text-secondary-hover focus-visible:outline-none focus-visible:underline"
                  >
                    {store.storeName}
                  </Link>
                ),
                secondary: (
                  <>
                    <p className="tabular-nums text-ink">
                      {store.orderCount.toLocaleString('th-TH')} คำสั่งซื้อ
                    </p>
                    <p className="tabular-nums text-muted-foreground">
                      {formatCurrency(store.revenue)}
                    </p>
                  </>
                ),
              }))}
            />
          </AnalyticsPanel>
        </div>
      </section>
    </div>
  );
}
