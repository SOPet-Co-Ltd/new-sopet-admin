'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { VendorReviewFilters } from '@/components/vendor/vendor-review-filters';
import { VendorReviewListItem } from '@/components/vendor/vendor-review-list-item';
import { VendorReviewListSkeleton } from '@/components/vendor/vendor-review-list-skeleton';
import { VendorReviewProductBreakdown } from '@/components/vendor/vendor-review-product-breakdown';
import { VendorReviewSummarySection } from '@/components/vendor/vendor-review-summary-section';
import { VendorReviewSummarySkeleton } from '@/components/vendor/vendor-review-summary-skeleton';
import { useStoreProductReviews, useStoreReviewSummary } from '@/hooks/useReviews';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { VENDOR_REVIEWS_PAGE_SIZE } from '@/lib/api/reviews';
import type { RatingFilter, ReplyFilter } from '@/lib/vendor/review-filters';

function formatFetchError(error: unknown): string {
  return error instanceof Error ? error.message : 'โหลดไม่สำเร็จ';
}

export default function VendorReviewsPage() {
  const storeId = useVendorStoreId();
  const [replyFilter, setReplyFilter] = useState<ReplyFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: VENDOR_REVIEWS_PAGE_SIZE,
      replyFilter,
      ratingFilter,
    }),
    [page, replyFilter, ratingFilter],
  );

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useStoreReviewSummary(storeId);
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useStoreProductReviews(storeId, queryParams);

  const reviews = reviewsData?.items ?? [];
  const pagination = reviewsData?.pagination;
  const filtersDisabled = !storeId || reviewsLoading;
  const hasActiveFilters = replyFilter !== 'all' || ratingFilter !== 'all';
  const hasNoReviews = summary?.reviewCount === 0;
  const hasFilterEmptyState =
    !reviewsLoading && !reviewsError && reviews.length === 0 && hasActiveFilters && !hasNoReviews;

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
              onReplyFilterChange={(value) => {
                setReplyFilter(value);
                setPage(1);
              }}
              onRatingFilterChange={(value) => {
                setRatingFilter(value);
                setPage(1);
              }}
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

          {!reviewsLoading && !reviewsError && hasNoReviews ? (
            <p className="text-sm text-muted">ยังไม่มีรีวิว</p>
          ) : null}

          {!reviewsLoading && !reviewsError && hasFilterEmptyState ? (
            <p className="text-sm text-muted">ไม่พบรีวิวที่ตรงกับตัวกรอง</p>
          ) : null}

          {!reviewsLoading && !reviewsError && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <VendorReviewListItem key={review.id} review={review} storeId={storeId} />
              ))}
            </div>
          ) : null}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                หน้า {pagination.page} จาก {pagination.totalPages} (ทั้งหมด {pagination.total}{' '}
                รายการ)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || reviewsLoading}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || reviewsLoading}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
