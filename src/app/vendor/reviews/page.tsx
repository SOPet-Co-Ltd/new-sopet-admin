'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useStoreProductReviews, useStoreReviewSummary } from '@/hooks/useReviews';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-brand">
      {'★'.repeat(rating)}
      <span className="text-muted">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

export default function VendorReviewsPage() {
  const storeId = useVendorStoreId();
  const { data: summary, isLoading: summaryLoading } = useStoreReviewSummary(storeId);
  const { data: reviews = [], isLoading: reviewsLoading, error } = useStoreProductReviews(storeId);

  return (
    <div className="space-y-6">
      <PageHeader title="รีวิว" description="รีวิวสินค้าจากลูกค้า" />

      {!storeId ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">กรุณาเลือกร้านค้าก่อนดูรีวิว</p>
          </CardBody>
        </Card>
      ) : null}

      {summaryLoading ? <p className="text-muted">กำลังโหลดสรุป...</p> : null}
      {summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardBody>
              <p className="text-sm text-muted">คะแนนเฉลี่ย</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">
                {summary.averageRating.toFixed(1)}
              </p>
              <Stars rating={Math.round(summary.averageRating)} />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-muted">จำนวนรีวิว</p>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">
                {summary.reviewCount}
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-1 text-sm text-muted">
              <p>5 ดาว: {summary.rating5Count}</p>
              <p>4 ดาว: {summary.rating4Count}</p>
              <p>3 ดาว: {summary.rating3Count}</p>
              <p>2 ดาว: {summary.rating2Count}</p>
              <p>1 ดาว: {summary.rating1Count}</p>
            </CardBody>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">รีวิวล่าสุด</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {reviewsLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : error ? (
            <p className="text-sm text-danger">
              {error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}
            </p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีรีวิว</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{review.productName ?? review.productId}</p>
                    {review.customerName ? (
                      <p className="text-sm text-muted">{review.customerName}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <Badge>{review.status}</Badge>
                  </div>
                </div>
                {review.comment ? <p className="mt-2 text-sm text-ink">{review.comment}</p> : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
