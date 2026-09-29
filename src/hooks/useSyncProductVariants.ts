'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncProductVariants } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';
import type { VariantItem } from '@/lib/variants';

export function useSyncProductVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variants }: { productId: string; variants: VariantItem[] }) =>
      syncProductVariants(productId, variants),
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
