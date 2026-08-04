'use client';

import { useQuery } from '@tanstack/react-query';
import { executeQuery } from '@/lib/graphql/client';
import { PRODUCTS_QUERY } from '@/lib/graphql/documents';
import { mapPagination, mapProduct } from '@/lib/graphql/mappers';
import { getVendorProducts } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';
import type { ProductsQueryParams, ProductsResult } from '@/types';

export function useVendorProducts(
  params: Omit<ProductsQueryParams, 'storeId'>,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getVendorProducts(params),
    enabled: options?.enabled ?? true,
  });
}

/** Platform catalog search — PRODUCTS_QUERY without required storeId (ADR Decision 4A). */
export function usePlatformProducts(
  params: ProductsQueryParams = {},
  options?: { enabled?: boolean },
) {
  // Intentionally omit storeId so platform search stays global.
  const { storeId: _omitStoreId, ...rest } = params;
  void _omitStoreId;
  const queryParams: ProductsQueryParams = { ...rest };

  return useQuery({
    queryKey: [...queryKeys.products.all, 'platform-catalog', queryParams] as const,
    queryFn: () =>
      executeQuery<{
        products: {
          items: Parameters<typeof mapProduct>[0][];
          pagination: Parameters<typeof mapPagination>[0];
        };
      }>(PRODUCTS_QUERY, queryParams).then((data): ProductsResult => ({
        items: data.products.items.map(mapProduct),
        pagination: mapPagination(data.products.pagination),
      })),
    enabled: options?.enabled ?? true,
  });
}
