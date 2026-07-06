'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncProductVariants } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';
import type { VariantItem } from '@/lib/variants';

export function useSyncProductVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variants,
      productBasePrice = 0,
    }: {
      productId: string;
      variants: VariantItem[];
      productBasePrice?: number;
    }) => syncProductVariants(productId, variants, productBasePrice),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.publishChecklist(variables.productId),
      });
    },
  });
}
