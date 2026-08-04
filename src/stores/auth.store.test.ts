import { beforeEach, describe, expect, it } from 'vitest';
import type { User } from '@/types';
import { useAuthStore } from './auth.store';

const STORAGE_KEY = 'sopet-admin-auth';

const user: User = {
  id: 'user-1',
  email: 'vendor@sopet.org',
  role: 'vendor',
} as User;

describe('useAuthStore cross-tab sync (row 38 regression)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, isAuthenticated: false, hasHydrated: true });
  });

  it('re-hydrates this tab from localStorage when another tab writes the auth key', async () => {
    // Simulate a sibling tab logging in: it writes the persisted store to localStorage,
    // but THIS tab's in-memory Zustand state (simulated above as still logged-out)
    // never sees it without the storage-event listener.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { user, isAuthenticated: true },
        version: 0,
      }),
    );

    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('re-hydrates to logged-out when another tab logs out', async () => {
    useAuthStore.setState({ user, isAuthenticated: true, hasHydrated: true });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { user: null, isAuthenticated: false }, version: 0 }),
    );

    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('ignores storage events for unrelated keys', async () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, hasHydrated: true });
    localStorage.setItem('some-other-key', 'irrelevant');

    window.dispatchEvent(new StorageEvent('storage', { key: 'some-other-key' }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
