'use client';

import { useEffect, useRef } from 'react';
import { useMyStores } from '@/hooks/useMyStores';
import { useSwitchStore } from '@/hooks/useSwitchStore';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { fetchAuthSession } from '@/lib/auth/client-session';
import { resolveVendorStoreSyncAction } from '@/lib/vendor/resolve-active-store';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';

/** Syncs JWT / persisted active store with the vendor's store list on mount. */
export function useVendorStoreSync() {
  const storeId = useVendorStoreId();
  const setActiveStoreId = useVendorStore((s) => s.setActiveStoreId);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const { data: stores = [], isLoading } = useMyStores();
  const switchStore = useSwitchStore();
  const syncedRef = useRef(false);
  const switchMutate = switchStore.mutate;

  useEffect(() => {
    if (isLoading || stores.length === 0 || syncedRef.current) return;

    let cancelled = false;

    void (async () => {
      const session = await fetchAuthSession();
      if (cancelled || syncedRef.current) return;

      const action = resolveVendorStoreSyncAction({
        stores,
        persistedStoreId: storeId,
        sessionStoreId: session.storeId,
      });

      syncedRef.current = true;

      if (action.type === 'keep' || action.type === 'noop') {
        return;
      }

      if (action.type === 'align-local') {
        setActiveStoreId(action.storeId);
        if (user) {
          setUser({ ...user, storeId: action.storeId });
        }
        return;
      }

      // 'switch' — mint JWT for persisted choice or first usable default.
      switchMutate(action.storeId);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, setActiveStoreId, setUser, storeId, stores, switchMutate, user]);
}
