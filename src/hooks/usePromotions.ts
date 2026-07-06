'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPromotion,
  deletePromotion,
  getPlatformPromotions,
  getStorePromotions,
  togglePromotion,
  updatePromotion,
} from '@/lib/api/promotions';
import { queryKeys } from '@/lib/react-query/keys';
import type { CreatePromotionInput, UpdatePromotionInput } from '@/types';

export function useStorePromotions(storeId?: string) {
  return useQuery({
    queryKey: queryKeys.promotions.store(storeId ?? ''),
    queryFn: () => getStorePromotions(storeId!),
    enabled: !!storeId,
  });
}

export function usePlatformPromotions() {
  return useQuery({
    queryKey: queryKeys.promotions.platform(),
    queryFn: getPlatformPromotions,
  });
}

export function usePlatformPromotion(id: string) {
  const query = usePlatformPromotions();
  const promotion = query.data?.find((item) => item.id === id);
  return {
    ...query,
    data: promotion,
    isNotFound: !query.isLoading && !query.error && !promotion,
  };
}

export function useStorePromotion(id: string, storeId?: string) {
  const query = useStorePromotions(storeId);
  const promotion = query.data?.find((item) => item.id === id);
  return {
    ...query,
    data: promotion,
    isNotFound: !!storeId && !query.isLoading && !query.error && !promotion,
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
