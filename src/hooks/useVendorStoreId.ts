'use client';

import { useMemo } from 'react';
import { getStoreIdFromToken } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';

export function useVendorStoreId(): string | undefined {
  const authHydrated = useAuthStore((s) => s.hasHydrated);
  const vendorHydrated = useVendorStore((s) => s.hasHydrated);
  const userStoreId = useAuthStore((s) => s.user?.storeId);
  const activeStoreId = useVendorStore((s) => s.activeStoreId);

  return useMemo(() => {
    if (!authHydrated || !vendorHydrated) {
      return undefined;
    }

    return activeStoreId ?? userStoreId ?? getStoreIdFromToken();
  }, [activeStoreId, authHydrated, userStoreId, vendorHydrated]);
}
