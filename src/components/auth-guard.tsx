'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  getPasswordChangePath,
  isPasswordChangeAllowedPath,
} from '@/lib/auth/must-change-password';
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
  const pathname = usePathname();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hasToken = typeof window !== 'undefined' ? hasClientSession() : false;
  const mustChangePassword = user?.mustChangePassword === true;

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
        router.replace(user.mustChangePassword ? getPasswordChangePath('admin') : '/admin/stores');
      } else if (user?.role === 'vendor') {
        router.replace(user.mustChangePassword ? getPasswordChangePath('vendor') : '/vendor');
      } else {
        router.replace('/login');
      }
      return;
    }

    if (mustChangePassword && !isPasswordChangeAllowedPath(pathname, user?.role)) {
      router.replace(getPasswordChangePath(user?.role));
    }
  }, [
    hasHydrated,
    hasToken,
    isAuthenticated,
    mustChangePassword,
    pathname,
    requiredRole,
    router,
    user?.mustChangePassword,
    user?.role,
  ]);

  if (!hasHydrated) {
    return <AuthGuardLoadingShell />;
  }

  if (!isAuthenticated || !hasToken) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  if (mustChangePassword && !isPasswordChangeAllowedPath(pathname, user?.role)) {
    return null;
  }

  return <>{children}</>;
}
