'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';

/**
 * Active vendor store after auth/vendor Zustand hydration.
 * Do not read JWT from the client — access tokens are HttpOnly; use
 * `/api/auth/session` (via useVendorStoreSync) when cookie storeId is needed.
 */
export function useVendorStoreId(): string | undefined {
  const authHydrated = useAuthStore((s) => s.hasHydrated);
  const vendorHydrated = useVendorStore((s) => s.hasHydrated);
  const userStoreId = useAuthStore((s) => s.user?.storeId);
  const activeStoreId = useVendorStore((s) => s.activeStoreId);

  return useMemo(() => {
    if (!authHydrated || !vendorHydrated) {
      return undefined;
    }

    return activeStoreId ?? userStoreId ?? undefined;
  }, [activeStoreId, authHydrated, userStoreId, vendorHydrated]);
}
