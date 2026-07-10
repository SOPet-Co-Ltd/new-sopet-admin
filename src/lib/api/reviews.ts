import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_REVIEW_REPLY_MUTATION,
  STORE_PRODUCT_REVIEWS_QUERY,
  STORE_REVIEW_SUMMARY_QUERY,
  UPDATE_REVIEW_REPLY_MUTATION,
} from '@/lib/graphql/documents';
import { mapProductReview, mapReviewReplyType, mapStoreReviewSummary } from '@/lib/graphql/mappers';
import type { ProductReview, ReviewReply, StoreReviewSummary } from '@/types';

type GqlProductReview = Parameters<typeof mapProductReview>[0];
type GqlStoreReviewSummary = Parameters<typeof mapStoreReviewSummary>[0];
type GqlReviewReply = Parameters<typeof mapReviewReplyType>[0];

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
