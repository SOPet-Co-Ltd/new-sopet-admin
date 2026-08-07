export type AccessibleStoreEntry = {
  store: {
    id: string;
    status: string;
  };
};

export type VendorStoreSyncAction =
  | { type: 'noop' }
  | { type: 'keep'; storeId: string }
  | { type: 'align-local'; storeId: string }
  | { type: 'switch'; storeId: string };

function isAccessible(
  stores: AccessibleStoreEntry[],
  storeId: string | null | undefined,
): storeId is string {
  return !!storeId && stores.some((entry) => entry.store.id === storeId);
}

/** Prefer a non-suspended store; fall back to any accessible store. */
export function pickPreferredAccessibleStoreId(
  stores: AccessibleStoreEntry[],
): string | undefined {
  if (stores.length === 0) return undefined;
  return (stores.find((entry) => entry.store.status !== 'suspended') ?? stores[0]).store.id;
}

/**
 * Decide how to reconcile JWT session store, persisted UI selection, and the
 * vendor's accessible store list. Never force-switch when a valid selection already exists.
 */
export function resolveVendorStoreSyncAction(params: {
  stores: AccessibleStoreEntry[];
  persistedStoreId?: string | null;
  sessionStoreId?: string | null;
}): VendorStoreSyncAction {
  const { stores, persistedStoreId, sessionStoreId } = params;
  if (stores.length === 0) {
    return { type: 'noop' };
  }

  // UI selection wins when still accessible — keep the store the vendor last chose.
  if (isAccessible(stores, persistedStoreId)) {
    if (sessionStoreId === persistedStoreId) {
      return { type: 'keep', storeId: persistedStoreId };
    }
    // JWT is missing/stale relative to localStorage — re-issue tokens for that store.
    return { type: 'switch', storeId: persistedStoreId };
  }

  // No usable local selection — trust the HttpOnly JWT via /api/auth/session.
  if (isAccessible(stores, sessionStoreId)) {
    return { type: 'align-local', storeId: sessionStoreId };
  }

  const preferred = pickPreferredAccessibleStoreId(stores);
  if (!preferred) {
    return { type: 'noop' };
  }
  return { type: 'switch', storeId: preferred };
}
