'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStoreApiKey, getStoreApiKeys, revokeStoreApiKey } from '@/lib/api/api-keys';
import { queryKeys } from '@/lib/react-query/keys';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

export function useStoreApiKeys() {
  const storeId = useVendorStoreId();

  return useQuery({
    queryKey: queryKeys.apiKeys.store(storeId ?? ''),
    queryFn: () => getStoreApiKeys(storeId!),
    enabled: !!storeId,
  });
}

export function useCreateStoreApiKey() {
  const storeId = useVendorStoreId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => {
      if (!storeId) throw new Error('ไม่พบร้านค้าที่เลือก');
      return createStoreApiKey(storeId, name);
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.store(storeId) });
      }
    },
  });
}

export function useRevokeStoreApiKey() {
  const storeId = useVendorStoreId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!storeId) throw new Error('ไม่พบร้านค้าที่เลือก');
      return revokeStoreApiKey(storeId, id);
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.store(storeId) });
      }
    },
  });
}
