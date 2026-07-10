'use client';

import { useMemo, useState } from 'react';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { VendorReviewFilters } from '@/components/vendor/vendor-review-filters';
import { VendorReviewListItem } from '@/components/vendor/vendor-review-list-item';
import { VendorReviewListSkeleton } from '@/components/vendor/vendor-review-list-skeleton';
import { VendorReviewProductBreakdown } from '@/components/vendor/vendor-review-product-breakdown';
import { VendorReviewSummarySection } from '@/components/vendor/vendor-review-summary-section';
import { VendorReviewSummarySkeleton } from '@/components/vendor/vendor-review-summary-skeleton';
import { useStoreProductReviews, useStoreReviewSummary } from '@/hooks/useReviews';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { filterReviews, type RatingFilter, type ReplyFilter } from '@/lib/vendor/review-filters';

function formatFetchError(error: unknown): string {
  return error instanceof Error ? error.message : 'โหลดไม่สำเร็จ';
}

export default function VendorReviewsPage() {
  const storeId = useVendorStoreId();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useStoreReviewSummary(storeId);
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useStoreProductReviews(storeId);

  const [replyFilter, setReplyFilter] = useState<ReplyFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');

  const filteredReviews = useMemo(
    () => filterReviews(reviews, replyFilter, ratingFilter),
    [reviews, replyFilter, ratingFilter],
  );

  const filtersDisabled = !storeId || reviewsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="รีวิว"
        description="รีวิวสินค้าจากลูกค้า"
        action={
          storeId ? (
            <VendorReviewFilters
              replyFilter={replyFilter}
              ratingFilter={ratingFilter}
              onReplyFilterChange={setReplyFilter}
              onRatingFilterChange={setRatingFilter}
              disabled={filtersDisabled}
            />
          ) : undefined
        }
      />

      {!storeId ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">กรุณาเลือกร้านค้าก่อนดูรีวิว</p>
          </CardBody>
        </Card>
      ) : null}

      {storeId && summaryLoading ? <VendorReviewSummarySkeleton /> : null}

      {storeId && summaryError ? (
        <p className="text-sm text-danger">{formatFetchError(summaryError)}</p>
      ) : null}

      {storeId && summary && !summaryLoading && !summaryError ? (
        <>
          <VendorReviewSummarySection summary={summary} />
          {summary.productBreakdown && summary.productBreakdown.length > 0 ? (
            <VendorReviewProductBreakdown productBreakdown={summary.productBreakdown} />
          ) : null}
        </>
      ) : null}

      {storeId ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display font-medium text-ink">รีวิวล่าสุด</h2>
            <p className="text-sm text-muted">รีวิวจากลูกค้าทั้งหมดในร้านของคุณ</p>
          </div>

          {reviewsLoading ? <VendorReviewListSkeleton /> : null}

          {reviewsError ? (
            <p className="text-sm text-danger">{formatFetchError(reviewsError)}</p>
          ) : null}

          {!reviewsLoading && !reviewsError && reviews.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีรีวิว</p>
          ) : null}

          {!reviewsLoading &&
          !reviewsError &&
          reviews.length > 0 &&
          filteredReviews.length === 0 ? (
            <p className="text-sm text-muted">ไม่พบรีวิวที่ตรงกับตัวกรอง</p>
          ) : null}

          {!reviewsLoading && !reviewsError && filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <VendorReviewListItem key={review.id} review={review} storeId={storeId} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
