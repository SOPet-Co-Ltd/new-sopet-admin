'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getVendorOrder,
  getVendorOrders,
  VENDOR_ORDERS_PAGE_SIZE,
  type VendorOrdersQueryParams,
} from '@/lib/api/orders';
import { queryKeys } from '@/lib/react-query/keys';

export type UseVendorOrdersParams = Omit<VendorOrdersQueryParams, 'storeId'> & {
  storeId?: string;
};

export function useVendorOrders(params: UseVendorOrdersParams) {
  const storeId = params.storeId;
  const page = params.page ?? 1;
  const limit = params.limit ?? VENDOR_ORDERS_PAGE_SIZE;
  const queue = params.queue;
  const status = params.status;
  const paymentMethod = params.paymentMethod;
  const search = params.search?.trim() || undefined;

  return useQuery({
    staleTime: 0,
    queryKey: queryKeys.orders.vendor({
      storeId: storeId ?? '',
      page,
      limit,
      queue,
      status,
      paymentMethod,
      search,
    }),
    queryFn: () =>
      getVendorOrders({
        storeId: storeId!,
        page,
        limit,
        queue,
        status,
        paymentMethod,
        search,
      }),
    enabled: !!storeId,
  });
}

export function useVendorOrder(storeId: string | undefined, orderId: string | undefined) {
  return useQuery({
    staleTime: 0,
    queryKey: queryKeys.orders.vendorDetail(storeId ?? '', orderId ?? ''),
    queryFn: () => getVendorOrder(storeId!, orderId!),
    enabled: Boolean(storeId && orderId),
  });
}
