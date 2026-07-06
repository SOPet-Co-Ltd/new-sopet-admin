import { executeQuery } from '@/lib/graphql/client';
import { STORE_PRODUCT_REVIEWS_QUERY, STORE_REVIEW_SUMMARY_QUERY } from '@/lib/graphql/documents';
import { mapProductReview, mapStoreReviewSummary } from '@/lib/graphql/mappers';
import type { ProductReview, StoreReviewSummary } from '@/types';

type GqlProductReview = Parameters<typeof mapProductReview>[0];
type GqlStoreReviewSummary = Parameters<typeof mapStoreReviewSummary>[0];

export function getStoreProductReviews(storeId: string): Promise<ProductReview[]> {
  return executeQuery<{ storeProductReviews: GqlProductReview[] }>(STORE_PRODUCT_REVIEWS_QUERY, {
    storeId,
  }).then((data) => data.storeProductReviews.map(mapProductReview));
}

export function getStoreReviewSummary(storeId: string): Promise<StoreReviewSummary> {
  return executeQuery<{ storeReviewSummary: GqlStoreReviewSummary }>(STORE_REVIEW_SUMMARY_QUERY, {
    storeId,
  }).then((data) => mapStoreReviewSummary(data.storeReviewSummary));
}
