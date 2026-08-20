'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { hasClientSession } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'vendor';
}

function AuthGuardLoadingShell() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="text-sm text-muted">กำลังโหลด...</p>
    </div>
  );
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasToken = typeof window !== 'undefined' ? hasClientSession() : false;

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
    return <AuthGuardLoadingShell />;
  }

  if (!isAuthenticated || !hasToken) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
