'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { switchStore } from '@/lib/api/stores';
import { applyAuthenticatedSession } from '@/lib/auth/apply-session';
import { useVendorStore } from '@/stores/vendor.store';

export function useSwitchStore() {
  const queryClient = useQueryClient();
  const setActiveStoreId = useVendorStore((s) => s.setActiveStoreId);

  return useMutation({
    mutationFn: switchStore,
    onSuccess: async (result) => {
      await applyAuthenticatedSession(result.user);
      if (result.user.storeId) {
        setActiveStoreId(result.user.storeId);
      }
      queryClient.invalidateQueries();
    },
  });
}
