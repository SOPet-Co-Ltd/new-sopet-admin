'use client';

import { useMemo } from 'react';
import { getStoreIdFromToken } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';

export function useVendorStoreId(): string | undefined {
  const userStoreId = useAuthStore((s) => s.user?.storeId);
  const activeStoreId = useVendorStore((s) => s.activeStoreId);

  return useMemo(() => {
    return activeStoreId ?? userStoreId ?? getStoreIdFromToken();
  }, [activeStoreId, userStoreId]);
}
