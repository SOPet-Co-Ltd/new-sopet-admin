'use client';

import { useMemo } from 'react';
import { useMyStores } from '@/hooks/useMyStores';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

export function useCurrentMembershipRole(): string | undefined {
  const storeId = useVendorStoreId();
  const { data: stores = [], isLoading } = useMyStores();

  const membershipRole = useMemo(() => {
    if (!storeId) return undefined;
    return stores.find((entry) => entry.store.id === storeId)?.membershipRole;
  }, [storeId, stores]);

  return membershipRole;
}

export function useIsStoreOwner() {
  const storeId = useVendorStoreId();
  const { data: stores = [], isLoading } = useMyStores();

  const membershipRole = useMemo(() => {
    if (!storeId) return undefined;
    return stores.find((entry) => entry.store.id === storeId)?.membershipRole;
  }, [storeId, stores]);

  return {
    isOwner: membershipRole === 'owner',
    membershipRole,
    isLoading,
  };
}

export function useIsStoreManager() {
  const storeId = useVendorStoreId();
  const { data: stores = [], isLoading } = useMyStores();

  const membershipRole = useMemo(() => {
    if (!storeId) return undefined;
    return stores.find((entry) => entry.store.id === storeId)?.membershipRole;
  }, [storeId, stores]);

  return {
    isManager: membershipRole === 'owner' || membershipRole === 'manager',
    membershipRole,
    isLoading,
  };
}
