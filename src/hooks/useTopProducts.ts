'use client';

import { useQuery } from '@tanstack/react-query';
import { getTopProducts } from '@/lib/api/top-products';
import { queryKeys } from '@/lib/react-query/keys';

export function useTopProducts(storeId?: string, limit = 5) {
  return useQuery({
    queryKey: queryKeys.topProducts.store(storeId ?? '', limit),
    queryFn: () => getTopProducts(storeId!, limit),
    enabled: !!storeId,
  });
}
