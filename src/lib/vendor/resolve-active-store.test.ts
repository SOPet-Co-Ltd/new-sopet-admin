import { describe, expect, it } from 'vitest';
import {
  pickPreferredAccessibleStoreId,
  resolveVendorStoreSyncAction,
} from './resolve-active-store';

const stores = [
  { store: { id: 'store-a', status: 'approved' } },
  { store: { id: 'store-b', status: 'approved' } },
  { store: { id: 'store-suspended', status: 'suspended' } },
];

describe('pickPreferredAccessibleStoreId', () => {
  it('prefers the first non-suspended store', () => {
    expect(
      pickPreferredAccessibleStoreId([
        { store: { id: 'suspended', status: 'suspended' } },
        { store: { id: 'ok', status: 'approved' } },
      ]),
    ).toBe('ok');
  });

  it('falls back to a suspended store when that is all the vendor has', () => {
    expect(pickPreferredAccessibleStoreId([{ store: { id: 'only', status: 'suspended' } }])).toBe(
      'only',
    );
  });
});

describe('resolveVendorStoreSyncAction', () => {
  it('keeps a persisted selection when JWT session already matches', () => {
    expect(
      resolveVendorStoreSyncAction({
        stores,
        persistedStoreId: 'store-b',
        sessionStoreId: 'store-b',
      }),
    ).toEqual({ type: 'keep', storeId: 'store-b' });
  });

  it('re-switches to the persisted selection when JWT is missing or stale', () => {
    expect(
      resolveVendorStoreSyncAction({
        stores,
        persistedStoreId: 'store-b',
        sessionStoreId: 'store-a',
      }),
    ).toEqual({ type: 'switch', storeId: 'store-b' });

    expect(
      resolveVendorStoreSyncAction({
        stores,
        persistedStoreId: 'store-b',
        sessionStoreId: null,
      }),
    ).toEqual({ type: 'switch', storeId: 'store-b' });
  });

  it('aligns local state from JWT session when persistence is empty', () => {
    expect(
      resolveVendorStoreSyncAction({
        stores,
        persistedStoreId: null,
        sessionStoreId: 'store-a',
      }),
    ).toEqual({ type: 'align-local', storeId: 'store-a' });
  });

  it('does not force-switch to preferred when a valid persisted store exists', () => {
    const action = resolveVendorStoreSyncAction({
      stores,
      persistedStoreId: 'store-b',
      sessionStoreId: undefined,
    });
    expect(action).toEqual({ type: 'switch', storeId: 'store-b' });
    expect(action).not.toEqual({ type: 'switch', storeId: 'store-a' });
  });

  it('switches to preferred only when neither persisted nor session is usable', () => {
    expect(
      resolveVendorStoreSyncAction({
        stores,
        persistedStoreId: 'gone',
        sessionStoreId: 'also-gone',
      }),
    ).toEqual({ type: 'switch', storeId: 'store-a' });
  });

  it('ignores inaccessible persisted ids and falls through to session', () => {
    expect(
      resolveVendorStoreSyncAction({
        stores,
        persistedStoreId: 'not-mine',
        sessionStoreId: 'store-b',
      }),
    ).toEqual({ type: 'align-local', storeId: 'store-b' });
  });

  it('returns noop when there are no stores', () => {
    expect(
      resolveVendorStoreSyncAction({
        stores: [],
        persistedStoreId: 'store-b',
        sessionStoreId: 'store-b',
      }),
    ).toEqual({ type: 'noop' });
  });
});
