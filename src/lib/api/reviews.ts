import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_REVIEW_REPLY_MUTATION,
  STORE_PRODUCT_REVIEWS_QUERY,
  STORE_REVIEW_SUMMARY_QUERY,
  UPDATE_REVIEW_REPLY_MUTATION,
} from '@/lib/graphql/documents';
import {
  mapPagination,
  mapProductReview,
  mapReviewReplyType,
  mapStoreReviewSummary,
} from '@/lib/graphql/mappers';
import type {
  Paginated,
  ProductReview,
  ReviewReply,
  StoreProductReviewsParams,
  StoreReviewSummary,
} from '@/types';

type GqlProductReview = Parameters<typeof mapProductReview>[0];
type GqlStoreReviewSummary = Parameters<typeof mapStoreReviewSummary>[0];
type GqlReviewReply = Parameters<typeof mapReviewReplyType>[0];

export const VENDOR_REVIEWS_PAGE_SIZE = 20;

export function getStoreProductReviews(
  storeId: string,
  params: StoreProductReviewsParams = {},
): Promise<Paginated<ProductReview>> {
  const replyFilter = params.replyFilter ?? 'all';
  const ratingFilter = params.ratingFilter ?? 'all';

  return executeQuery<{
    storeProductReviews: {
      items: GqlProductReview[];
      pagination: Parameters<typeof mapPagination>[0];
    };
  }>(STORE_PRODUCT_REVIEWS_QUERY, {
    storeId,
    page: params.page ?? 1,
    limit: params.limit ?? VENDOR_REVIEWS_PAGE_SIZE,
    replyFilter: replyFilter === 'all' ? undefined : replyFilter,
    ratingFilter: ratingFilter === 'all' ? undefined : ratingFilter,
  }).then((data) => ({
    items: data.storeProductReviews.items.map(mapProductReview),
    pagination: mapPagination(data.storeProductReviews.pagination),
  }));
}

export function getStoreReviewSummary(storeId: string): Promise<StoreReviewSummary> {
  return executeQuery<{ storeReviewSummary: GqlStoreReviewSummary }>(STORE_REVIEW_SUMMARY_QUERY, {
    storeId,
  }).then((data) => mapStoreReviewSummary(data.storeReviewSummary));
}

export function createReviewReply(input: { reviewId: string; body: string }): Promise<ReviewReply> {
  return executeMutation<{ createReviewReply: GqlReviewReply }>(CREATE_REVIEW_REPLY_MUTATION, {
    input,
  }).then((data) => mapReviewReplyType(data.createReviewReply));
}

export function updateReviewReply(input: { replyId: string; body: string }): Promise<ReviewReply> {
  return executeMutation<{ updateReviewReply: GqlReviewReply }>(UPDATE_REVIEW_REPLY_MUTATION, {
    input,
  }).then((data) => mapReviewReplyType(data.updateReviewReply));
}
