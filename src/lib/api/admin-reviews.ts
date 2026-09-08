import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  APPROVE_REVIEW_MUTATION,
  APPROVE_REVIEWS_MUTATION,
  PENDING_IMPORTED_REVIEWS_QUERY,
  PENDING_IMPORTED_REVIEW_IDS_QUERY,
  REJECT_REVIEW_MUTATION,
} from '@/lib/graphql/documents';
import { getErrorMessage } from '@/lib/api/errors';
import { mapPagination } from '@/lib/graphql/mappers';
import type { BatchApproveReviewsResult, Paginated } from '@/types';

export type AdminImportedReview = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string | null;
  rating: number;
  comment: string | null;
  status: string;
  source: string;
  customerName: string;
  createdAt: string;
  images: Array<{ id: string; url: string }>;
};

export const ADMIN_IMPORTED_REVIEWS_PAGE_SIZE = 20;

/** Smaller chunks stay under Cloudflare's 120s proxy window even on a slow origin. */
export const BATCH_APPROVE_MAX_IDS = 10;

export type BatchApproveProgress = {
  processed: number;
  total: number;
  chunkStart: number;
  chunkEnd: number;
};

export type BatchApproveProgressCallback = (progress: BatchApproveProgress) => void;

export function getPendingImportedReviews(
  page = 1,
  limit = ADMIN_IMPORTED_REVIEWS_PAGE_SIZE,
): Promise<Paginated<AdminImportedReview>> {
  return executeQuery<{
    pendingImportedReviews: {
      items: AdminImportedReview[];
      pagination: Parameters<typeof mapPagination>[0];
    };
  }>(PENDING_IMPORTED_REVIEWS_QUERY, { page, limit }).then((data) => ({
    items: data.pendingImportedReviews.items,
    pagination: mapPagination(data.pendingImportedReviews.pagination),
  }));
}

/** One lightweight IDs query for select-all (no review body hydration). */
export async function getPendingImportedReviewIds(): Promise<string[]> {
  const result = await executeQuery<{
    pendingImportedReviewIds: { ids: string[]; total: number };
  }>(PENDING_IMPORTED_REVIEW_IDS_QUERY);
  return result.pendingImportedReviewIds.ids;
}

export function approveReview(id: string): Promise<{ id: string; status: string }> {
  return executeMutation<{ approveReview: { id: string; status: string } }>(
    APPROVE_REVIEW_MUTATION,
    { id },
  ).then((data) => data.approveReview);
}

export function approveReviews(ids: string[]): Promise<BatchApproveReviewsResult> {
  return executeMutation<{ approveReviews: BatchApproveReviewsResult }>(APPROVE_REVIEWS_MUTATION, {
    ids,
  }).then((data) => data.approveReviews);
}

/** Approve in chunks of BATCH_APPROVE_MAX_IDS and merge partial-success results. */
export async function approveReviewsBatched(
  ids: string[],
  onProgress?: BatchApproveProgressCallback,
): Promise<BatchApproveReviewsResult> {
  const uniqueIds = [...new Set(ids)];
  const approvedIds: string[] = [];
  const failures: BatchApproveReviewsResult['failures'] = [];
  const total = uniqueIds.length;

  for (let i = 0; i < uniqueIds.length; i += BATCH_APPROVE_MAX_IDS) {
    const chunk = uniqueIds.slice(i, i + BATCH_APPROVE_MAX_IDS);
    const chunkStart = i + 1;
    const chunkEnd = Math.min(i + chunk.length, total);
    onProgress?.({
      processed: i,
      total,
      chunkStart,
      chunkEnd,
    });

    try {
      const result = await approveReviews(chunk);
      approvedIds.push(...result.approvedIds);
      failures.push(...result.failures);
    } catch (err) {
      const message = getErrorMessage(err, 'อนุมัติรีวิวไม่สำเร็จ');
      for (const reviewId of chunk) {
        failures.push({
          reviewId,
          code: 'CHUNK_FAILED',
          message,
        });
      }
    }

    onProgress?.({
      processed: chunkEnd,
      total,
      chunkStart,
      chunkEnd,
    });
  }

  return {
    approvedCount: approvedIds.length,
    failedCount: failures.length,
    approvedIds,
    failures,
  };
}

export function rejectReview(id: string): Promise<{ id: string; status: string }> {
  return executeMutation<{ rejectReview: { id: string; status: string } }>(REJECT_REVIEW_MUTATION, {
    id,
  }).then((data) => data.rejectReview);
}
