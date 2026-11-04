'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_ORDERS_PAGE_SIZE,
  getAdminOrder,
  getAdminOrders,
  updateAdminOrderShippingAddress,
  updateAdminOrderStatus,
} from '@/lib/api/admin-orders';
import { queryKeys } from '@/lib/react-query/keys';
import type { UpdateOrderShippingAddressAsAdminInput, UpdateOrderStatusInput } from '@/types';

export function useAdminOrders(params: { page?: number; search?: string; status?: string }) {
  const page = params.page ?? 1;
  const search = params.search?.trim() || undefined;
  const status = params.status || undefined;

  return useQuery({
    queryKey: queryKeys.adminOrders.list({ page, search, status }),
    queryFn: () =>
      getAdminOrders({
        page,
        limit: ADMIN_ORDERS_PAGE_SIZE,
        search,
        status,
      }),
  });
}

export function useAdminOrder(id?: string) {
  return useQuery({
    queryKey: queryKeys.adminOrders.detail(id ?? ''),
    queryFn: () => getAdminOrder(id!),
    enabled: Boolean(id),
  });
}

function invalidateAdminOrder(queryClient: ReturnType<typeof useQueryClient>, orderId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.detail(orderId) });
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrderStatusInput) => updateAdminOrderStatus(input),
    onSuccess: (_data, variables) => {
      invalidateAdminOrder(queryClient, variables.orderId);
    },
  });
}

export function useUpdateAdminOrderShippingAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrderShippingAddressAsAdminInput) =>
      updateAdminOrderShippingAddress(input),
    onSuccess: (_data, variables) => {
      invalidateAdminOrder(queryClient, variables.orderId);
    },
  });
}
