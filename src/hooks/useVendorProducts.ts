'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorProducts } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';
import type { ProductsQueryParams } from '@/types';

export function useVendorProducts(params: Omit<ProductsQueryParams, 'storeId'>) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getVendorProducts(params),
  });
}
