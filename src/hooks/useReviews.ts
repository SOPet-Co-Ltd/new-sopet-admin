'use client';

import { useQuery } from '@tanstack/react-query';
import { getStoreProductReviews, getStoreReviewSummary } from '@/lib/api/reviews';
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
