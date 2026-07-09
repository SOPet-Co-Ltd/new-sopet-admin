'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyStores } from '@/lib/api/stores';
import { queryKeys } from '@/lib/react-query/keys';

export function useMyStores() {
  return useQuery({
    staleTime: 2 * 60 * 1000, // Vendor store list changes occasionally
    queryKey: queryKeys.stores.myStores(),
    queryFn: getMyStores,
  });
}
