'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPromotion,
  deletePromotion,
  getPlatformPromotions,
  getPromotion,
  getStorePromotions,
  togglePromotion,
  updatePromotion,
} from '@/lib/api/promotions';
import { queryKeys } from '@/lib/react-query/keys';
import type { CreatePromotionInput, PromotionsQueryParams, UpdatePromotionInput } from '@/types';

export function useStorePromotions(storeId?: string, params: PromotionsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.promotions.store(storeId ?? '', params),
    queryFn: () => getStorePromotions(storeId!, params),
    enabled: !!storeId,
  });
}

export function usePlatformPromotions(params: PromotionsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.promotions.platform(params),
    queryFn: () => getPlatformPromotions(params),
  });
}

export function usePromotion(id: string) {
  const query = useQuery({
    queryKey: queryKeys.promotions.detail(id),
    queryFn: () => getPromotion(id),
    enabled: !!id,
  });
  return {
    ...query,
    isNotFound: !query.isLoading && !query.data,
  };
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePromotionInput) => createPromotion(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePromotionInput }) =>
      updatePromotion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all });
    },
  });
}

export function useTogglePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      togglePromotion(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all });
    },
  });
}
