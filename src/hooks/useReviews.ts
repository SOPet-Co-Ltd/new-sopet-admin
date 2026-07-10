'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReviewReply,
  getStoreProductReviews,
  getStoreReviewSummary,
  updateReviewReply,
} from '@/lib/api/reviews';
import { queryKeys } from '@/lib/react-query/keys';

export function useStoreProductReviews(storeId?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.store(storeId ?? ''),
    queryFn: () => getStoreProductReviews(storeId!),
    enabled: !!storeId,
  });
}

export function useStoreReviewSummary(storeId?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(storeId ?? ''),
    queryFn: () => getStoreReviewSummary(storeId!),
    enabled: !!storeId,
  });
}

export function useCreateReviewReply(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { toastError: false },
    mutationFn: (input: { reviewId: string; body: string }) => createReviewReply(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.store(storeId) });
    },
  });
}

export function useUpdateReviewReply(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { toastError: false },
    mutationFn: (input: { replyId: string; body: string }) => updateReviewReply(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.store(storeId) });
    },
  });
}
