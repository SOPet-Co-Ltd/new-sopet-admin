'use client';

import { useQuery } from '@tanstack/react-query';
import { getProductVariantSyncImpact, toSyncVariantGraphqlVariables } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';
import type { VariantItem } from '@/lib/variants';

export function useVariantSyncImpact(productId: string, variants: VariantItem[], enabled = true) {
  const payloadKey = JSON.stringify(toSyncVariantGraphqlVariables(variants));

  return useQuery({
    staleTime: 0,
    queryKey: queryKeys.products.variantSyncImpact(productId, payloadKey),
    queryFn: () => getProductVariantSyncImpact(productId, variants),
    enabled: enabled && !!productId,
  });
}
