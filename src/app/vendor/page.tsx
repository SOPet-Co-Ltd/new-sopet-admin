'use client';

import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { useTopProducts } from '@/hooks/useTopProducts';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

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

export default function VendorDashboardPage() {
  const storeId = useVendorStoreId();
  const { data, isLoading, error } = useStoreAnalytics(storeId);
  const { data: topProducts = [], isLoading: topLoading } = useTopProducts(storeId, 5);

  return (
    <div>
      <PageHeader title="แดชบอร์ด" description="ภาพรวมประสิทธิภาพร้านค้าของคุณ" />

      {!storeId ? (
        <Card className="mb-6 border-brand-soft bg-brand-tint/40">
          <CardBody>
            <p className="text-sm text-brand-hover">
              ไม่พบร้านค้าในเซสชัน · ข้อมูลจะแสดงหลังเข้าสู่ระบบด้วยบัญชีผู้ขายที่เชื่อมกับร้านค้า
            </p>
          </CardBody>
        </Card>
      ) : null}

      {isLoading ? <p className="text-muted">กำลังโหลดข้อมูล...</p> : null}
      {error ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ'}
        </p>
      ) : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="รายได้รวม" value={formatCurrency(data.totalRevenue)} />
          <StatCard label="คำสั่งซื้อทั้งหมด" value={data.totalOrders} />
          <StatCard label="สินค้า" value={data.totalProducts} />
          <StatCard label="รอดำเนินการ" value={data.pendingOrders} />
          <StatCard label="คำสั่งซื้อ 30 วันล่าสุด" value={data.recentOrders} />
        </div>
      ) : null}

      {storeId ? (
        <Card className="mt-8">
          <CardHeader>
            <h2 className="font-display font-medium text-ink">สินค้าขายดี</h2>
          </CardHeader>
          <CardBody>
            {topLoading ? (
              <p className="text-sm text-muted">กำลังโหลด...</p>
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีข้อมูล</p>
            ) : (
              <ul className="space-y-2">
                {topProducts.map((product, index) => (
                  <li
                    key={product.productId}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-tint text-sm font-medium text-brand">
                        {index + 1}
                      </span>
                      <p className="font-medium text-ink">{product.productName}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-ink">{product.totalSold} ชิ้น</p>
                      <p className="text-muted">{formatCurrency(product.revenue)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      ) : null}

      {!storeId && !isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="รายได้รวม" value="—" />
          <StatCard label="คำสั่งซื้อทั้งหมด" value="—" />
          <StatCard label="สินค้า" value="—" />
        </div>
      ) : null}
    </div>
  );
}
