'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorPublishableProducts } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';

export function useVendorPublishableProducts(
  params: { search?: string; page?: number; limit?: number } = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.products.publishable(params),
    queryFn: () => getVendorPublishableProducts(params),
    enabled: options?.enabled ?? true,
  });
}
