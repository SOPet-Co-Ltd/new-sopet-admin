'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminCustomer,
  getAdminCustomerDetail,
  getAdminCustomers,
  setCustomerActive,
  updateCustomerAsAdmin,
} from '@/lib/api/admin-customers';
import { queryKeys } from '@/lib/react-query/keys';
import type { CustomersQueryParams, UpdateCustomerAsAdminInput } from '@/types';

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
