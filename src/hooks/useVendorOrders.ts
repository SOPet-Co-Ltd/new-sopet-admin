'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorOrders } from '@/lib/api/orders';
import { queryKeys } from '@/lib/react-query/keys';

export function useVendorOrders() {
  return useQuery({
    queryKey: queryKeys.orders.vendor(),
    queryFn: getVendorOrders,
  });
}
