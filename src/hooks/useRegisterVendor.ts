'use client';

import { useMutation } from '@tanstack/react-query';
import { registerVendor } from '@/lib/api/auth';
import { setTokens } from '@/lib/api/client';
import { getStoreIdFromToken } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import type { LoginResult, RegisterVendorInput } from '@/types';

export function useRegisterVendor() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<LoginResult, Error, RegisterVendorInput>({
    mutationFn: registerVendor,
    onSuccess: (result) => {
      setTokens(result.accessToken, result.refreshToken);
      const storeId = getStoreIdFromToken(result.accessToken);
      setUser({ ...result.user, storeId });
      if (storeId) {
        useVendorStore.getState().setActiveStoreId(storeId);
      }
    },
  });
}
