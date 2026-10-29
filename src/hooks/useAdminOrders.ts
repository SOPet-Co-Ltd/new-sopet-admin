'use client';

import { useQuery } from '@tanstack/react-query';
import { ADMIN_ORDERS_PAGE_SIZE, getAdminOrder, getAdminOrders } from '@/lib/api/admin-orders';
import { queryKeys } from '@/lib/react-query/keys';

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
