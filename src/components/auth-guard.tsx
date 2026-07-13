'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/api/client';
import { isAccessTokenUsable } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth.store';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'vendor';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const accessToken = typeof window !== 'undefined' ? getAccessToken() : undefined;
  const hasToken = isAccessTokenUsable(accessToken);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated || !hasToken) {
      router.replace('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (user?.role === 'admin') {
        router.replace('/admin/stores');
      } else if (user?.role === 'vendor') {
        router.replace('/vendor');
      } else {
        router.replace('/login');
      }
    }
  }, [hasHydrated, hasToken, isAuthenticated, requiredRole, router, user?.role]);

  if (!hasHydrated) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !hasToken) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
