import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  APPROVE_REVIEW_MUTATION,
  PENDING_IMPORTED_REVIEWS_QUERY,
  REJECT_REVIEW_MUTATION,
} from '@/lib/graphql/documents';
import { mapPagination } from '@/lib/graphql/mappers';
import type { Paginated } from '@/types';

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

export function approveReview(id: string): Promise<{ id: string; status: string }> {
  return executeMutation<{ approveReview: { id: string; status: string } }>(
    APPROVE_REVIEW_MUTATION,
    { id },
  ).then((data) => data.approveReview);
}

export function rejectReview(id: string): Promise<{ id: string; status: string }> {
  return executeMutation<{ rejectReview: { id: string; status: string } }>(REJECT_REVIEW_MUTATION, {
    id,
  }).then((data) => data.rejectReview);
}
