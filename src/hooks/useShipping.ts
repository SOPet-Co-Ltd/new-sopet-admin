'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateStoreShippingOption,
  adminDeleteStoreShippingOption,
  adminUpdateStoreShippingOption,
  createShippingOption,
  createShippingProvider,
  deleteShippingOption,
  deleteShippingProvider,
  getAdminStoreShippingOptions,
  getMyStoreShippingOptions,
  getShippingProviders,
  updateShippingOption,
  updateShippingProvider,
} from '@/lib/api/shipping';
import { queryKeys } from '@/lib/react-query/keys';
import type {
  CreateShippingOptionInput,
  CreateShippingProviderInput,
  UpdateShippingOptionInput,
  UpdateShippingProviderInput,
} from '@/types';

export function useShippingProviders(includeInactive?: boolean) {
  return useQuery({
    queryKey: queryKeys.shippingProviders.list(includeInactive),
    queryFn: () => getShippingProviders(includeInactive),
  });
}

export function useMyStoreShippingOptions() {
  return useQuery({
    queryKey: queryKeys.storeShippingOptions.mine(),
    queryFn: getMyStoreShippingOptions,
  });
}

export function useAdminStoreShippingOptions(storeId: string) {
  return useQuery({
    queryKey: queryKeys.storeShippingOptions.admin(storeId),
    queryFn: () => getAdminStoreShippingOptions(storeId),
    enabled: !!storeId,
  });
}

export function useCreateShippingProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShippingProviderInput) => createShippingProvider(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shippingProviders.all });
    },
  });
}

export function useUpdateShippingProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShippingProviderInput }) =>
      updateShippingProvider(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shippingProviders.all });
    },
  });
}

export function useDeleteShippingProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShippingProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shippingProviders.all });
    },
  });
}

export function useCreateShippingOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShippingOptionInput) => createShippingOption(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeShippingOptions.all });
    },
  });
}

export function useUpdateShippingOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShippingOptionInput }) =>
      updateShippingOption(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeShippingOptions.all });
    },
  });
}

export function useDeleteShippingOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShippingOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeShippingOptions.all });
    },
  });
}

export function useAdminCreateStoreShippingOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ storeId, input }: { storeId: string; input: CreateShippingOptionInput }) =>
      adminCreateStoreShippingOption(storeId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeShippingOptions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.storeShippingOptions.admin(variables.storeId),
      });
    },
  });
}

export function useAdminUpdateStoreShippingOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; input: UpdateShippingOptionInput; storeId: string }) =>
      adminUpdateStoreShippingOption(variables.id, variables.input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeShippingOptions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.storeShippingOptions.admin(variables.storeId),
      });
    },
  });
}

export function useAdminDeleteStoreShippingOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; storeId: string }) => adminDeleteStoreShippingOption(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storeShippingOptions.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.storeShippingOptions.admin(variables.storeId),
      });
    },
  });
}
