'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveStoreReactivationRequest,
  getAdminStoreReactivationRequests,
  getStoreReactivationRequests,
  rejectStoreReactivationRequest,
  submitStoreReactivationRequest,
} from '@/lib/api/store-reactivation-requests';
import { queryKeys } from '@/lib/react-query/keys';
import type { SubmitStoreReactivationRequestInput } from '@/types';

export function useStoreReactivationRequests(storeId?: string) {
  return useQuery({
    queryKey: queryKeys.storeReactivationRequests.byStore(storeId ?? ''),
    queryFn: () => getStoreReactivationRequests(storeId!),
    enabled: !!storeId,
  });
}

export function useAdminStoreReactivationRequests(status?: string) {
  return useQuery({
    queryKey: queryKeys.storeReactivationRequests.admin(status),
    queryFn: () => getAdminStoreReactivationRequests(status),
  });
}

export function useSubmitStoreReactivationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitStoreReactivationRequestInput) =>
      submitStoreReactivationRequest(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.storeReactivationRequests.byStore(variables.storeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.storeReactivationRequests.all });
    },
  });
}

export function useApproveStoreReactivationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveStoreReactivationRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeReactivationRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    },
  });
}

export function useRejectStoreReactivationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote?: string }) =>
      rejectStoreReactivationRequest(id, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeReactivationRequests.all });
    },
  });
}
