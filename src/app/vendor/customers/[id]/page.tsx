'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HiArrowLeft, HiHeart, HiStar } from 'react-icons/hi2';
import { AdminCustomerOrderHistory } from '@/components/admin/admin-customer-order-history';
import { StatCard } from '@/components/vendor/stat-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useVendorCustomerDetail } from '@/hooks/useVendorCustomers';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function VendorCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: customer, isLoading, error } = useVendorCustomerDetail(params.id);

  if (isLoading) return <p className="text-muted">กำลังโหลด...</p>;
  if (error || !customer) {
    return (
      <p className="text-danger" role="alert">
        {error instanceof Error ? error.message : 'ไม่พบลูกค้า'}
      </p>
    );
  }

  const { insights } = customer;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.fullName || customer.phone}
        description="รายละเอียดลูกค้า (อ่านอย่างเดียว)"
        back={
          <Link
            href="/vendor/customers"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับรายการลูกค้า
          </Link>
        }
      />

      <div>
        <Badge status={customer.isVerified ? 'published' : 'draft'}>
          {customer.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="ยอดใช้จ่ายที่ร้าน" value={formatCurrency(insights.totalSpent)} />
        <StatCard
          label="จำนวนคำสั่งซื้อที่ร้าน"
          value={insights.orderCount}
          hint="ไม่รวมคำสั่งซื้อที่ยกเลิก คืนเงิน หรือรอชำระ"
        />
        <StatCard
          label="ยอดเฉลี่ยต่อคำสั่งซื้อ"
          value={formatCurrency(insights.averageOrderValue)}
        />
        <StatCard
          label="สั่งซื้อล่าสุดที่ร้าน"
          value={insights.lastOrderAt ? formatDateTime(insights.lastOrderAt) : 'ยังไม่เคยสั่งซื้อ'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">ข้อมูลลูกค้า</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <span className="text-muted">เบอร์โทรศัพท์</span>
              <span className="text-right font-medium text-ink">{customer.phone}</span>
            </div>
            {customer.email ? (
              <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted">อีเมล</span>
                <span className="text-right font-medium text-ink">{customer.email}</span>
              </div>
            ) : null}
            {customer.fullName ? (
              <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted">ชื่อ-นามสกุล</span>
                <span className="text-right font-medium text-ink">{customer.fullName}</span>
              </div>
            ) : null}
            {customer.createdAt ? (
              <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted">สมัครเมื่อ</span>
                <span className="text-right text-ink">{formatDateTime(customer.createdAt)}</span>
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted">เข้าสู่ระบบล่าสุด</span>
              <span className="text-right text-ink">
                {customer.lastLoginAt
                  ? formatDateTime(customer.lastLoginAt)
                  : 'ยังไม่เคยเข้าสู่ระบบ'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">กิจกรรมกับร้าน</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <HiHeart className="size-4" aria-hidden="true" />
                สินค้าที่ชอบ
              </span>
              <span className="text-right text-ink">{insights.favoriteCount} รายการ</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <HiStar className="size-4" aria-hidden="true" />
                รีวิวที่เขียน
              </span>
              <span className="text-right text-ink">{insights.reviewCount} รายการ</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <AdminCustomerOrderHistory
        orders={insights.recentOrders}
        title="ประวัติการสั่งซื้อที่ร้าน"
        description="แสดงคำสั่งซื้อ 10 รายการล่าสุดที่มีสินค้าจากร้านนี้ (ยอดรวมเฉพาะสินค้าของร้าน)"
        emptyMessage="ยังไม่มีประวัติการสั่งซื้อที่ร้าน"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">รีวิวล่าสุดที่ร้าน</h2>
            <p className="text-sm text-muted">รีวิวสินค้าของร้านที่ลูกค้าเขียน</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {insights.recentReviews.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีรีวิวจากลูกค้ารายนี้</p>
            ) : (
              insights.recentReviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-ink">{review.productName}</p>
                    <span className="shrink-0 text-brand">{review.rating}/5</span>
                  </div>
                  {review.comment ? <p className="mt-2 text-muted">{review.comment}</p> : null}
                  <p className="mt-2 text-xs text-muted">{formatDateTime(review.createdAt)}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">สินค้าที่ชอบล่าสุด</h2>
            <p className="text-sm text-muted">สินค้าของร้านที่ลูกค้ากดชอบ</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {insights.favoriteProducts.length === 0 ? (
              <p className="text-sm text-muted">ยังไม่มีสินค้าที่ชอบจากลูกค้ารายนี้</p>
            ) : (
              insights.favoriteProducts.map((favorite) => (
                <div
                  key={`${favorite.productName}-${favorite.createdAt}`}
                  className="flex items-start justify-between gap-3 border-b border-border pb-3 text-sm last:border-b-0 last:pb-0"
                >
                  <span className="font-medium text-ink">{favorite.productName}</span>
                  <span className="shrink-0 text-muted">{formatDateTime(favorite.createdAt)}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
