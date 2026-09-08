'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_IMPORTED_REVIEWS_PAGE_SIZE,
  approveReview,
  approveReviewsBatched,
  getPendingImportedReviews,
  rejectReview,
  type BatchApproveProgressCallback,
} from '@/lib/api/admin-reviews';
import { queryKeys } from '@/lib/react-query/keys';

export function usePendingImportedReviews(page = 1) {
  return useQuery({
    queryKey: queryKeys.reviews.pendingImported(page),
    queryFn: () => getPendingImportedReviews(page, ADMIN_IMPORTED_REVIEWS_PAGE_SIZE),
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pendingImported'] });
    },
  });
}

export function useApproveReviews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ids,
      onProgress,
    }: {
      ids: string[];
      onProgress?: BatchApproveProgressCallback;
    }) => approveReviewsBatched(ids, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pendingImported'] });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'pendingImported'] });
    },
  });
}
