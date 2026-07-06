'use client';

import { useQuery } from '@tanstack/react-query';
import { getProductPublishChecklist } from '@/lib/api/products';
import { queryKeys } from '@/lib/react-query/keys';

export function useProductPublishChecklist(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.publishChecklist(productId),
    queryFn: () => getProductPublishChecklist(productId),
    enabled: !!productId,
  });
}
