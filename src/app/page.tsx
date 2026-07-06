'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/api/client';
import { getDashboardPath, useCurrentUser } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useCurrentUser();
  const hasToken = typeof window !== 'undefined' && !!getAccessToken();

  useEffect(() => {
    if (!isAuthenticated || !hasToken) {
      router.replace('/login');
      return;
    }
    const role = user?.role;
    if (role) {
      router.replace(getDashboardPath(role));
    }
  }, [hasToken, isAuthenticated, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted">กำลังเปลี่ยนหน้า...</p>
    </div>
  );
}
