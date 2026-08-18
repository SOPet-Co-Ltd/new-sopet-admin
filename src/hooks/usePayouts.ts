'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStorePayoutSummary,
  getAdminStorePayouts,
  getPendingManualPayouts,
  getStorePayoutSummary,
  getStorePayouts,
  rejectManualPayout,
  requestManualPayout,
  requestPayout,
  settleManualPayout,
  triggerPayout,
  ADMIN_MANUAL_PAYOUT_PAGE_SIZE,
} from '@/lib/api/payouts';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import { queryKeys } from '@/lib/react-query/keys';

export function useStorePayoutSummary(enabled = true) {
  const { isOwner } = useIsStoreOwner();
  return useQuery({
    queryKey: queryKeys.payouts.vendorSummary(),
    queryFn: getStorePayoutSummary,
    enabled: enabled && isOwner,
  });
}

export function useStorePayouts(enabled = true) {
  const { isOwner } = useIsStoreOwner();
  return useQuery({
    queryKey: queryKeys.payouts.vendorHistory(),
    queryFn: getStorePayouts,
    enabled: enabled && isOwner,
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

export function useRequestManualPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestManualPayout,
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

export function useSettleManualPayout(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { payoutId?: string; notes?: string }) =>
      settleManualPayout({ storeId, payoutId: input?.payoutId, notes: input?.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.adminSummary(storeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.adminHistory(storeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.pendingManual() });
    },
  });
}

export function useRejectManualPayout(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { payoutId?: string; notes?: string }) =>
      rejectManualPayout({ storeId, payoutId: input?.payoutId, notes: input?.notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.adminSummary(storeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.adminHistory(storeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.pendingManual() });
    },
  });
}

export function usePendingManualPayouts(page = 1) {
  return useQuery({
    queryKey: queryKeys.payouts.pendingManual(page),
    queryFn: () => getPendingManualPayouts(page, ADMIN_MANUAL_PAYOUT_PAGE_SIZE),
  });
}

export function useSettleManualPayoutForQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { storeId: string; payoutId: string; notes?: string }) =>
      settleManualPayout(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.pendingManual() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payouts.adminSummary(variables.storeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payouts.adminHistory(variables.storeId),
      });
    },
  });
}

export function useRejectManualPayoutForQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { storeId: string; payoutId: string; notes?: string }) =>
      rejectManualPayout(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.pendingManual() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payouts.adminSummary(variables.storeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payouts.adminHistory(variables.storeId),
      });
    },
  });
}
