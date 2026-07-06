'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStoreAsAdmin,
  getAdminStore,
  getAdminStores,
  updateStoreAsAdmin,
} from '@/lib/api/admin-stores';
import { queryKeys } from '@/lib/react-query/keys';
import type { CreateStoreAsAdminInput, UpdateStoreAsAdminInput } from '@/types';

export function useAdminStores() {
  return useQuery({
    queryKey: queryKeys.adminStores.list(),
    queryFn: getAdminStores,
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
    },
  });
}
