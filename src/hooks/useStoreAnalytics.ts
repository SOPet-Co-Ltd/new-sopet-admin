'use client';

import { useQuery } from '@tanstack/react-query';
import { getStoreAnalytics } from '@/lib/api/analytics';
import { queryKeys } from '@/lib/react-query/keys';

export function useStoreAnalytics(storeId?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.store(storeId ?? ''),
    queryFn: () => getStoreAnalytics(storeId!),
    enabled: !!storeId,
  });
}
