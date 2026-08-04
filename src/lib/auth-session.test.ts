import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getMe } from '@/lib/api/auth';
import { clearTokens, hasClientSession } from '@/lib/api/client';
import { getApolloClient } from '@/lib/graphql/client';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import {
  clearAuthSession,
  markEmailVerified,
  refreshAuthUser,
  resetSessionCaches,
  syncEmailVerificationStatus,
} from './auth-session';

vi.mock('@/lib/api/client', () => ({
  clearTokens: vi.fn(),
  hasClientSession: vi.fn(),
}));

vi.mock('@/lib/api/auth', () => ({
  getMe: vi.fn(),
}));

vi.mock('@/lib/graphql/client', () => ({
  getApolloClient: vi.fn(),
}));

describe('auth-session', () => {
  let queryClient: QueryClient;
  const clearStore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
    vi.mocked(getApolloClient).mockReturnValue({
      clearStore,
    } as unknown as ReturnType<typeof getApolloClient>);
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'a@test.com',
        fullName: 'A',
        role: 'vendor',
        emailVerified: false,
      },
      isAuthenticated: true,
      hasHydrated: true,
    });
    useVendorStore.setState({ activeStoreId: 'store-a', hasHydrated: true });
    vi.mocked(hasClientSession).mockReturnValue(true);
  });

  describe('resetSessionCaches', () => {
    it('clears TanStack Query and Apollo caches', () => {
      queryClient.setQueryData(['stores', 'myStores'], [{ store: { id: 'store-a' } }]);
      const clearSpy = vi.spyOn(queryClient, 'clear');

      resetSessionCaches(queryClient);

      expect(clearSpy).toHaveBeenCalledOnce();
      expect(clearStore).toHaveBeenCalledOnce();
      expect(queryClient.getQueryData(['stores', 'myStores'])).toBeUndefined();
    });
  });

  describe('clearAuthSession', () => {
    it('clears tokens, auth store, vendor store, and caches', () => {
      queryClient.setQueryData(['stores', 'myStores'], [{ store: { id: 'store-a' } }]);

      clearAuthSession(queryClient);

      expect(clearTokens).toHaveBeenCalledOnce();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useVendorStore.getState().activeStoreId).toBeNull();
      expect(queryClient.getQueryData(['stores', 'myStores'])).toBeUndefined();
      expect(clearStore).toHaveBeenCalledOnce();
    });
  });

  describe('markEmailVerified', () => {
    it('sets emailVerified on the current user', () => {
      markEmailVerified();

      expect(useAuthStore.getState().user?.emailVerified).toBe(true);
    });
  });

  describe('refreshAuthUser', () => {
    it('merges fresh profile from me into the auth store', async () => {
      vi.mocked(getMe).mockResolvedValue({
        id: '1',
        email: 'a@test.com',
        fullName: 'A',
        role: 'vendor',
        emailVerified: true,
      });

      const result = await refreshAuthUser();

      expect(result?.emailVerified).toBe(true);
      expect(useAuthStore.getState().user?.emailVerified).toBe(true);
    });

    it('returns null when no authenticated user exists', async () => {
      useAuthStore.getState().clearAuth();

      await expect(refreshAuthUser()).resolves.toBeNull();
      expect(getMe).not.toHaveBeenCalled();
    });

    it('does not revive the auth store if the user logged out while getMe was in flight', async () => {
      let resolveGetMe: (value: Awaited<ReturnType<typeof getMe>>) => void = () => {};
      vi.mocked(getMe).mockReturnValue(
        new Promise((resolve) => {
          resolveGetMe = resolve;
        }),
      );

      const pending = refreshAuthUser();
      useAuthStore.getState().clearAuth();
      resolveGetMe({
        id: '1',
        email: 'a@test.com',
        fullName: 'A',
        role: 'vendor',
        emailVerified: true,
      });

      await expect(pending).resolves.toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('syncEmailVerificationStatus', () => {
    it('marks email verified and refreshes profile', async () => {
      vi.mocked(getMe).mockResolvedValue({
        id: '1',
        email: 'a@test.com',
        fullName: 'A',
        role: 'vendor',
        emailVerified: true,
      });

      await syncEmailVerificationStatus();

      expect(useAuthStore.getState().user?.emailVerified).toBe(true);
      expect(getMe).toHaveBeenCalledOnce();
    });
  });
});
