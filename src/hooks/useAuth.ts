'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from '@/lib/api/auth';
import { setTokens, clearTokens } from '@/lib/api/client';
import { getStoreIdFromToken } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import type { LoginInput, LoginResult } from '@/types';

const PORTAL_ROLES = new Set(['admin', 'vendor']);

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<LoginResult, Error, LoginInput>({
    mutationFn: async (input) => {
      clearTokens();
      const result = await login(input);
      if (!PORTAL_ROLES.has(result.user.role)) {
        throw new Error('พอร์ทัลนี้สำหรับผู้ดูแลระบบและผู้ขายเท่านั้น');
      }
      return result;
    },
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

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearVendor = useVendorStore((s) => s.clearVendor);
  return () => {
    clearTokens();
    clearAuth();
    clearVendor();
  };
}

export function useCurrentUser() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return { user, isAuthenticated };
}

export function getDashboardPath(role?: string): string {
  if (role === 'admin') return '/admin/stores';
  if (role === 'vendor') return '/vendor';
  return '/login';
}
