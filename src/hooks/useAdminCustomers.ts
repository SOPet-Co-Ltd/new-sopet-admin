'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCustomerAddressAsAdmin,
  deleteCustomerAddressAsAdmin,
  getAdminCustomer,
  getAdminCustomerAddresses,
  getAdminCustomerDetail,
  getAdminCustomers,
  setCustomerActive,
  setCustomerDefaultAddressAsAdmin,
  updateCustomerAddressAsAdmin,
  updateCustomerAsAdmin,
  verifyCustomerPhoneAsAdmin,
} from '@/lib/api/admin-customers';
import { queryKeys } from '@/lib/react-query/keys';
import type {
  CreateCustomerAddressAsAdminInput,
  CustomersQueryParams,
  UpdateCustomerAddressAsAdminInput,
  UpdateCustomerAsAdminInput,
} from '@/types';

export function useAdminCustomers(params: CustomersQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminCustomers.list(params),
    queryFn: () => getAdminCustomers(params),
  });
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.adminCustomers.detail(id),
    queryFn: () => getAdminCustomer(id),
    enabled: !!id,
  });
}

export function useAdminCustomerDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.adminCustomers.detailInsights(id),
    queryFn: () => getAdminCustomerDetail(id),
    enabled: !!id,
  });
}

export function useAdminCustomerAddresses(customerId: string) {
  return useQuery({
    queryKey: queryKeys.adminCustomers.addresses(customerId),
    queryFn: () => getAdminCustomerAddresses(customerId),
    enabled: !!customerId,
  });
}

export function useUpdateCustomerAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerAsAdminInput }) =>
      updateCustomerAsAdmin(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.detail(variables.id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminCustomers.detailInsights(variables.id),
      });
    },
  });
}

export function useSetCustomerActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setCustomerActive(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.detail(variables.id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminCustomers.detailInsights(variables.id),
      });
    },
  });
}

export function useVerifyCustomerPhoneAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyCustomerPhoneAsAdmin(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.detail(id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminCustomers.detailInsights(id),
      });
    },
  });
}

function invalidateCustomerAddresses(
  queryClient: ReturnType<typeof useQueryClient>,
  customerId: string,
) {
  queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers.addresses(customerId) });
  queryClient.invalidateQueries({
    queryKey: queryKeys.adminCustomers.detailInsights(customerId),
  });
}

export function useCreateCustomerAddressAsAdmin(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerAddressAsAdminInput) =>
      createCustomerAddressAsAdmin(customerId, input),
    onSuccess: () => invalidateCustomerAddresses(queryClient, customerId),
  });
}

export function useUpdateCustomerAddressAsAdmin(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerAddressAsAdminInput }) =>
      updateCustomerAddressAsAdmin(customerId, id, input),
    onSuccess: () => invalidateCustomerAddresses(queryClient, customerId),
  });
}

export function useDeleteCustomerAddressAsAdmin(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomerAddressAsAdmin(customerId, id),
    onSuccess: () => invalidateCustomerAddresses(queryClient, customerId),
  });
}

export function useSetCustomerDefaultAddressAsAdmin(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => setCustomerDefaultAddressAsAdmin(customerId, id),
    onSuccess: () => invalidateCustomerAddresses(queryClient, customerId),
  });
}
