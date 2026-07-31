'use client';

import { useEffect, useRef } from 'react';
import { useMyStores } from '@/hooks/useMyStores';
import { useSwitchStore } from '@/hooks/useSwitchStore';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { getStoreIdFromToken } from '@/lib/jwt';
import { useVendorStore } from '@/stores/vendor.store';

/** Syncs JWT / persisted active store with the vendor's store list on mount. */
export function useVendorStoreSync() {
  const storeId = useVendorStoreId();
  const jwtStoreId = getStoreIdFromToken();
  const setActiveStoreId = useVendorStore((s) => s.setActiveStoreId);
  const { data: stores = [], isLoading } = useMyStores();
  const switchStore = useSwitchStore();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isLoading || stores.length === 0 || syncedRef.current) return;

    const jwtEntry = jwtStoreId ? stores.find((entry) => entry.store.id === jwtStoreId) : undefined;
    const hasJwtStore = !!jwtEntry;

    if (!hasJwtStore) {
      syncedRef.current = true;
      // Prefer a non-suspended store as default, but fall back to any store
      // (including suspended) so vendors can enter and request reactivation.
      const preferred = stores.find((entry) => entry.store.status !== 'suspended') ?? stores[0];
      if (preferred) {
        switchStore.mutate(preferred.store.id);
      }
      return;
    }

    // Keep suspended JWT store selected — vendor may enter read-only and submit
    // a reactivation request. Mutations stay blocked by StoreStatusGuard.
    const preferredStoreId = jwtStoreId ?? storeId ?? stores[0].store.id;
    if (!storeId) {
      setActiveStoreId(preferredStoreId);
    }
    syncedRef.current = true;
  }, [isLoading, jwtStoreId, setActiveStoreId, storeId, stores, switchStore]);
}
