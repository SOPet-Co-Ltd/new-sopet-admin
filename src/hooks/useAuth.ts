'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '@/lib/api/auth';
import { clearTokens } from '@/lib/api/client';
import { applyAuthenticatedSession } from '@/lib/auth/apply-session';
import { clearAuthSession, resetSessionCaches } from '@/lib/auth-session';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import type { LoginInput, LoginResult } from '@/types';
import { useRouter } from 'next/navigation';

const PORTAL_ROLES = new Set(['admin', 'vendor']);

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResult, Error, LoginInput>({
    mutationFn: async (input) => {
      await clearTokens();
      useAuthStore.getState().clearAuth();
      useVendorStore.getState().clearVendor();
      const result = await login(input);
      if (!PORTAL_ROLES.has(result.user.role)) {
        throw new Error('พอร์ทัลนี้สำหรับผู้ดูแลระบบและผู้ขายเท่านั้น');
      }
      return result;
    },
    onSuccess: async (result) => {
      await applyAuthenticatedSession(result.user);
      resetSessionCaches(queryClient);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return () => {
    clearAuthSession(queryClient);
    router.replace('/login');
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
