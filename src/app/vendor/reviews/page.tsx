'use client';

import { useMemo, useState } from 'react';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VendorReviewFilters } from '@/components/vendor/vendor-review-filters';
import { VendorReviewListItem } from '@/components/vendor/vendor-review-list-item';
import { VendorReviewListSkeleton } from '@/components/vendor/vendor-review-list-skeleton';
import { VendorReviewProductBreakdown } from '@/components/vendor/vendor-review-product-breakdown';
import { VendorReviewSummarySection } from '@/components/vendor/vendor-review-summary-section';
import { VendorReviewSummarySkeleton } from '@/components/vendor/vendor-review-summary-skeleton';
import { VendorReviewsEmptyState } from '@/components/vendor/vendor-reviews-empty-state';
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

  function clearFilters() {
    setReplyFilter('all');
    setRatingFilter('all');
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="รีวิว"
        description="รีวิวสินค้าจากลูกค้า — สรุปคะแนนและตอบกลับได้ที่นี่"
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

      <div className="space-y-6">
        {!storeId ? (
          <Card className="border-brand-soft bg-brand-tint/40">
            <CardBody>
              <p className="text-sm text-brand-hover">
                กรุณาเลือกร้านค้าก่อนดูรีวิว ·
                ข้อมูลจะแสดงหลังเลือกหรือเข้าสู่ระบบด้วยบัญชีผู้ขายที่เชื่อมกับร้านค้า
              </p>
            </CardBody>
          </Card>
        ) : null}

        {storeId && summaryLoading ? <VendorReviewSummarySkeleton /> : null}

        {storeId && summaryError ? (
          <p className="text-sm text-danger" role="alert">
            {formatFetchError(summaryError)}
          </p>
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
          <section className="space-y-4" aria-labelledby="vendor-reviews-latest">
            <div>
              <h2
                id="vendor-reviews-latest"
                className="text-balance font-display font-medium text-ink"
              >
                รีวิวล่าสุด
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                รีวิวจากลูกค้าทั้งหมดในร้านของคุณ
              </p>
            </div>

            {reviewsLoading ? <VendorReviewListSkeleton /> : null}

            {reviewsError ? (
              <p className="text-sm text-danger" role="alert">
                {formatFetchError(reviewsError)}
              </p>
            ) : null}

            {!reviewsLoading && !reviewsError && hasNoReviews ? (
              <VendorReviewsEmptyState mode="catalog" />
            ) : null}

            {!reviewsLoading && !reviewsError && hasFilterEmptyState ? (
              <VendorReviewsEmptyState mode="filtered" onClearFilters={clearFilters} />
            ) : null}

            {!reviewsLoading && !reviewsError && reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <VendorReviewListItem review={review} storeId={storeId} />
                  </li>
                ))}
              </ul>
            ) : null}

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  หน้า {pagination.page} จาก {pagination.totalPages} (ทั้งหมด{' '}
                  {pagination.total.toLocaleString('th-TH')} รายการ)
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
    </div>
  );
}
