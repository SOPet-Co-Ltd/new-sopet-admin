'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveStoreRequest,
  getAdminStoreRequests,
  getMyStoreRequests,
  getPendingStoreRequests,
  rejectStoreRequest,
  submitStoreRequest,
} from '@/lib/api/store-requests';
import { queryKeys } from '@/lib/react-query/keys';
import type { SubmitStoreRequestInput } from '@/types';

export function useMyStoreRequests() {
  return useQuery({
    queryKey: queryKeys.storeRequests.mine(),
    queryFn: getMyStoreRequests,
  });
}

export function usePendingStoreRequests() {
  return useQuery({
    queryKey: queryKeys.storeRequests.pending(),
    queryFn: getPendingStoreRequests,
  });
}

/** Full history (pending/approved/rejected) for the admin request center. */
export function useAdminStoreRequests(enabled = true) {
  return useQuery({
    queryKey: queryKeys.storeRequests.adminAll(),
    queryFn: getAdminStoreRequests,
    enabled,
  });
}

export function useSubmitStoreRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitStoreRequestInput) => submitStoreRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeRequests.all });
    },
  });
}

export function useApproveStoreRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveStoreRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeRequests.all });
    },
  });
}

export function useRejectStoreRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectStoreRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeRequests.all });
    },
  });
}
