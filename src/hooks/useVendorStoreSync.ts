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

    const nonSuspended = stores.filter((entry) => entry.store.status !== 'suspended');
    const jwtEntry = jwtStoreId ? stores.find((entry) => entry.store.id === jwtStoreId) : undefined;
    const hasJwtStore = !!jwtEntry;

    if (!hasJwtStore) {
      syncedRef.current = true;
      if (nonSuspended.length > 0) {
        switchStore.mutate(nonSuspended[0].store.id);
      } else if (stores[0]) {
        setActiveStoreId(stores[0].store.id);
      }
      return;
    }

    if (jwtEntry?.store.status === 'suspended' && nonSuspended.length > 0) {
      syncedRef.current = true;
      switchStore.mutate(nonSuspended[0].store.id);
      return;
    }

    const preferredStoreId = jwtStoreId ?? storeId ?? stores[0].store.id;
    if (!storeId) {
      setActiveStoreId(preferredStoreId);
    }
  }, [isLoading, jwtStoreId, setActiveStoreId, storeId, stores, switchStore]);
}
