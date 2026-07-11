'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { switchStore } from '@/lib/api/stores';
import { setTokens } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';

export function useSwitchStore() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveStoreId = useVendorStore((s) => s.setActiveStoreId);

  return useMutation({
    mutationFn: switchStore,
    onSuccess: (result) => {
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      if (result.user.storeId) {
        setActiveStoreId(result.user.storeId);
      }
      queryClient.invalidateQueries();
    },
  });
}
