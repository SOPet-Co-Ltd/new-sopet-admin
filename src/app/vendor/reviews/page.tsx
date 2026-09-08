'use client';

import { useMemo } from 'react';
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
import { getErrorMessage } from '@/lib/api/errors';
import {
  parseEnumParam,
  parsePageParam,
  serializeEnumParam,
  serializePageParam,
} from '@/lib/navigation/list-query-params';
import { useListQueryState, type ListQuerySpec } from '@/lib/navigation/use-list-query-state';
import type { RatingFilter, ReplyFilter } from '@/lib/vendor/review-filters';

function formatFetchError(error: unknown): string {
  return getErrorMessage(error, 'โหลดไม่สำเร็จ');
}

const REPLY_VALUES = ['all', 'unreplied', 'replied'] as const;
const RATING_VALUES = ['all', '1', '2', '3', '4', '5'] as const;

const vendorReviewsQuerySpec = {
  page: { parse: parsePageParam, serialize: serializePageParam },
  reply: {
    parse: (raw: string | null) => parseEnumParam(raw, REPLY_VALUES, 'all') as ReplyFilter,
    serialize: (value: ReplyFilter) => serializeEnumParam(value, 'all'),
  },
  rating: {
    parse: (raw: string | null) => parseEnumParam(raw, RATING_VALUES, 'all') as RatingFilter,
    serialize: (value: RatingFilter) => serializeEnumParam(value, 'all'),
  },
} satisfies ListQuerySpec;

export default function VendorReviewsPage() {
  const storeId = useVendorStoreId();
  const [params, setParams] = useListQueryState(vendorReviewsQuerySpec);
  const { page, reply: replyFilter, rating: ratingFilter } = params;

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
    setParams({ reply: 'all', rating: 'all', page: 1 });
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
                setParams({ reply: value });
              }}
              onRatingFilterChange={(value) => {
                setParams({ rating: value });
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
                    onClick={() => setParams((current) => ({ page: current.page - 1 }))}
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages || reviewsLoading}
                    onClick={() => setParams((current) => ({ page: current.page + 1 }))}
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
