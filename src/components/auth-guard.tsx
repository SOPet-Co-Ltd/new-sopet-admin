'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { hasClientSession } from '@/lib/api/client';
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

  // SOPET-M-14: never flash protected children before hydration.
  if (!hasHydrated) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted">กำลังโหลด...</p>
      </div>
    );
  }

  if (!isAuthenticated || !hasToken) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted">กำลังโหลด...</p>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-muted">กำลังโหลด...</p>
      </div>
    );
  }

  return <>{children}</>;
}
