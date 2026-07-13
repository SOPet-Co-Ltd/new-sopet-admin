'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStorePayoutSummary,
  getAdminStorePayouts,
  getStorePayoutSummary,
  getStorePayouts,
  requestPayout,
  triggerPayout,
} from '@/lib/api/payouts';
import { queryKeys } from '@/lib/react-query/keys';

export function useStorePayoutSummary() {
  return useQuery({
    queryKey: queryKeys.payouts.vendorSummary(),
    queryFn: getStorePayoutSummary,
  });
}

export function useStorePayouts() {
  return useQuery({
    queryKey: queryKeys.payouts.vendorHistory(),
    queryFn: getStorePayouts,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

export function useAdminStorePayoutSummary(storeId: string) {
  return useQuery({
    queryKey: queryKeys.payouts.adminSummary(storeId),
    queryFn: () => getAdminStorePayoutSummary(storeId),
    enabled: !!storeId,
  });
}

export function useAdminStorePayouts(storeId: string) {
  return useQuery({
    queryKey: queryKeys.payouts.adminHistory(storeId),
    queryFn: () => getAdminStorePayouts(storeId),
    enabled: !!storeId,
  });
}

export function useTriggerPayout(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount?: number) => triggerPayout({ storeId, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.adminSummary(storeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.adminHistory(storeId) });
    },
  });
}
