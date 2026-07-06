'use client';

import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}
