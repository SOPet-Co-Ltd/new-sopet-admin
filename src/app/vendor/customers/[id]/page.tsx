'use client';

import { useParams } from 'next/navigation';
import { HiHeart, HiStar } from 'react-icons/hi2';
import { AdminCustomerOrderHistory } from '@/components/admin/admin-customer-order-history';
import {
  BackToCustomersLink,
  CustomerDetailSkeleton,
  DetailRow,
  formatCustomerOrderDate,
  InsightFact,
} from '@/components/customers/customer-detail-primitives';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useVendorCustomerDetail } from '@/hooks/useVendorCustomers';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function VendorCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: customer, isLoading, error } = useVendorCustomerDetail(params.id);

  if (isLoading) return <CustomerDetailSkeleton />;

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <BackToCustomersLink href="/vendor/customers" />
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'ไม่พบลูกค้า'}
        </p>
      </div>
    );
  }

  const { insights } = customer;
  const displayName = customer.fullName?.trim() || customer.phone;

  return (
    <div className="space-y-8">
      <PageHeader
        title={displayName}
        description="รายละเอียดลูกค้า (อ่านอย่างเดียว)"
        back={<BackToCustomersLink href="/vendor/customers" />}
        action={
          <Badge status={customer.isVerified ? 'published' : 'draft'}>
            {customer.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
          </Badge>
        }
      />

      <section aria-labelledby="customer-store-insights">
        <h2 id="customer-store-insights" className="sr-only">
          สรุปการซื้อที่ร้าน
        </h2>
        <Card>
          <CardBody>
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <InsightFact label="ยอดใช้จ่ายที่ร้าน">
                {formatCurrency(insights.totalSpent)}
              </InsightFact>
              <InsightFact
                label="จำนวนคำสั่งซื้อที่ร้าน"
                hint="ไม่รวมคำสั่งซื้อที่ยกเลิก คืนเงิน หรือรอชำระ"
              >
                {insights.orderCount.toLocaleString('th-TH')}
              </InsightFact>
              <InsightFact label="ยอดเฉลี่ยต่อคำสั่งซื้อ">
                {formatCurrency(insights.averageOrderValue)}
              </InsightFact>
              <InsightFact label="สั่งซื้อล่าสุดที่ร้าน">
                {insights.lastOrderAt
                  ? formatCustomerOrderDate(insights.lastOrderAt)
                  : 'ยังไม่เคยสั่งซื้อ'}
              </InsightFact>
            </dl>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold text-ink text-balance">ข้อมูลลูกค้า</h2>
          <p className="mt-1 text-sm text-muted-foreground">ข้อมูลติดต่อและกิจกรรมกับร้านนี้</p>
        </CardHeader>
        <CardBody className="space-y-3 text-sm">
          <DetailRow label="เบอร์โทรศัพท์">{customer.phone}</DetailRow>
          {customer.email ? <DetailRow label="อีเมล">{customer.email}</DetailRow> : null}
          {customer.fullName ? (
            <DetailRow label="ชื่อ-นามสกุล">{customer.fullName}</DetailRow>
          ) : null}
          {customer.createdAt ? (
            <DetailRow label="สมัครเมื่อ">{formatDateTime(customer.createdAt)}</DetailRow>
          ) : null}
          <DetailRow label="เข้าสู่ระบบล่าสุด">
            {customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : 'ยังไม่เคยเข้าสู่ระบบ'}
          </DetailRow>
          <DetailRow
            label={
              <span className="inline-flex items-center gap-1.5">
                <HiHeart className="size-4" aria-hidden="true" />
                สินค้าที่ชอบ
              </span>
            }
          >
            {insights.favoriteCount.toLocaleString('th-TH')} รายการ
          </DetailRow>
          <DetailRow
            label={
              <span className="inline-flex items-center gap-1.5">
                <HiStar className="size-4" aria-hidden="true" />
                รีวิวที่เขียน
              </span>
            }
          >
            {insights.reviewCount.toLocaleString('th-TH')} รายการ
          </DetailRow>
        </CardBody>
      </Card>

      <AdminCustomerOrderHistory
        orders={insights.recentOrders}
        title="ประวัติการสั่งซื้อที่ร้าน"
        description="แสดงคำสั่งซื้อ 10 รายการล่าสุดที่มีสินค้าจากร้านนี้ (ยอดรวมเฉพาะสินค้าของร้าน)"
        emptyMessage="ยังไม่มีประวัติการสั่งซื้อที่ร้าน"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink text-balance">
              รีวิวล่าสุดที่ร้าน
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">รีวิวสินค้าของร้านที่ลูกค้าเขียน</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {insights.recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-pretty">
                ยังไม่มีรีวิวจากลูกค้ารายนี้ — เมื่อลูกค้าเขียนรีวิวสินค้าของร้าน จะแสดงที่นี่
              </p>
            ) : (
              <ul className="space-y-3">
                {insights.recentReviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-lg border border-border bg-card p-3 text-sm transition-colors duration-200 ease-out motion-reduce:transition-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 font-medium break-words text-ink text-pretty">
                        {review.productName}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 tabular-nums text-brand">
                        <HiStar className="size-3.5" aria-hidden="true" />
                        {review.rating}/5
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="mt-2 whitespace-pre-wrap text-muted-foreground text-pretty">
                        {review.comment}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(review.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink text-balance">
              สินค้าที่ชอบล่าสุด
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">สินค้าของร้านที่ลูกค้ากดชอบ</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {insights.favoriteProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-pretty">
                ยังไม่มีสินค้าที่ชอบจากลูกค้ารายนี้ — สินค้าที่ลูกค้ากดชอบจะแสดงที่นี่
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {insights.favoriteProducts.map((favorite) => (
                  <li
                    key={`${favorite.productName}-${favorite.createdAt}`}
                    className="flex items-start justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="min-w-0 font-medium break-words text-ink text-pretty">
                      {favorite.productName}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDateTime(favorite.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
