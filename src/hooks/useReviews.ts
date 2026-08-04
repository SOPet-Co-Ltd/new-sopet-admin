'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReviewReply,
  getStoreProductReviews,
  getStoreReviewSummary,
  updateReviewReply,
} from '@/lib/api/reviews';
import { queryKeys } from '@/lib/react-query/keys';
import type { StoreProductReviewsParams } from '@/types';

export function useStoreProductReviews(storeId?: string, params: StoreProductReviewsParams = {}) {
  return useQuery({
    queryKey: queryKeys.reviews.store(storeId ?? '', params),
    queryFn: () => getStoreProductReviews(storeId!, params),
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
      // Prefix without params so all paginated store queries match
      queryClient.invalidateQueries({ queryKey: ['reviews', 'store', storeId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.summary(storeId) });
    },
  });
}

export function useUpdateReviewReply(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { toastError: false },
    mutationFn: (input: { replyId: string; body: string }) => updateReviewReply(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'store', storeId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.summary(storeId) });
    },
  });
}
