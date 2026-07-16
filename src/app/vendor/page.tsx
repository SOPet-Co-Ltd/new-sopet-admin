'use client';

import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { PageHeader } from '@/components/ui/card';
import { StatCard } from '@/components/vendor/stat-card';
import { VendorActionQueue } from '@/components/vendor/vendor-action-queue';
import { VendorAnalyticsReport } from '@/components/vendor/vendor-analytics-report';
import { VendorDashboardSkeleton } from '@/components/vendor/vendor-dashboard-skeleton';
import { VendorPayoutSnapshot } from '@/components/vendor/vendor-payout-snapshot';
import { Card, CardBody } from '@/components/ui/card';

export default function VendorDashboardPage() {
  const storeId = useVendorStoreId();
  const { data: operational, isLoading: operationalLoading, error } = useStoreAnalytics(storeId);
  const { data: orders = [], isLoading: ordersLoading } = useVendorOrders(storeId);

  const isLoading = operationalLoading || ordersLoading;

  return (
    <div className="min-w-0 space-y-8">
      <PageHeader title="งานวันนี้" description="ออเดอร์ที่ต้องดำเนินการและภาพรวมร้านค้า" />

      {!storeId ? (
        <Card className="border-brand-soft bg-brand-tint/40">
          <CardBody>
            <p className="text-sm text-brand-hover">
              ไม่พบร้านค้าในเซสชัน · ข้อมูลจะแสดงหลังเข้าสู่ระบบด้วยบัญชีผู้ขายที่เชื่อมกับร้านค้า
            </p>
          </CardBody>
        </Card>
      ) : null}

      {isLoading ? <VendorDashboardSkeleton /> : null}

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ'}
        </p>
      ) : null}

      {storeId && !isLoading ? (
        <>
          <VendorActionQueue orders={orders} storeId={storeId} />

          <VendorPayoutSnapshot />

          {operational ? (
            <section aria-labelledby="vendor-ops-kpis" className="space-y-3">
              <h2 id="vendor-ops-kpis" className="text-lg font-medium text-ink">
                ภาพรวมร้านค้า
              </h2>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="คำสั่งซื้อ 7 วันล่าสุด"
                  value={operational.recentOrders}
                  href="/vendor/orders"
                />
                <StatCard
                  label="คำสั่งซื้อทั้งหมด"
                  value={operational.totalOrders}
                  href="/vendor/orders?queue=all"
                />
                <StatCard
                  label="สินค้าในร้าน"
                  value={operational.totalProducts}
                  href="/vendor/products"
                />
              </div>
            </section>
          ) : null}

          <VendorAnalyticsReport orders={orders} storeId={storeId} />
        </>
      ) : null}
    </div>
  );
}
