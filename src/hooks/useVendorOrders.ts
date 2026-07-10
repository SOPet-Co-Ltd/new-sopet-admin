'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorOrders } from '@/lib/api/orders';
import { queryKeys } from '@/lib/react-query/keys';

export function useVendorOrders(storeId?: string) {
  return useQuery({
    staleTime: 0, // Order status changes frequently
    queryKey: queryKeys.orders.vendor(storeId ?? ''),
    queryFn: () => getVendorOrders(storeId!),
    enabled: !!storeId,
  });
}
