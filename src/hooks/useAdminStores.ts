'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStoreAsAdmin,
  getAdminStore,
  getAdminStores,
  rejectStoreBankAccount,
  updateStoreAsAdmin,
  verifyStoreBankAccount,
} from '@/lib/api/admin-stores';
import { queryKeys } from '@/lib/react-query/keys';
import type {
  AdminStoresQueryParams,
  CreateStoreAsAdminInput,
  UpdateStoreAsAdminInput,
} from '@/types';

export function useAdminStores(params: AdminStoresQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.adminStores.list(params),
    queryFn: () => getAdminStores(params),
  });
}

export function useAdminStore(id: string) {
  return useQuery({
    queryKey: queryKeys.adminStores.detail(id),
    queryFn: () => getAdminStore(id),
    enabled: !!id,
  });
}

export function useCreateStoreAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStoreAsAdminInput) => createStoreAsAdmin(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    },
  });
}

export function useUpdateStoreAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateStoreAsAdminInput }) =>
      updateStoreAsAdmin(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    },
  });
}

function invalidateStoreBankQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  storeId: string,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.detail(storeId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
}

export function useVerifyStoreBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) => verifyStoreBankAccount(storeId),
    onSuccess: (_data, storeId) => invalidateStoreBankQueries(queryClient, storeId),
  });
}

export function useRejectStoreBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, reason }: { storeId: string; reason: string }) =>
      rejectStoreBankAccount(storeId, reason),
    onSuccess: (_data, variables) => invalidateStoreBankQueries(queryClient, variables.storeId),
  });
}
