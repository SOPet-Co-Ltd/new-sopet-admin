import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import { useVendorStoreSync } from './useVendorStoreSync';

const switchMutate = vi.fn();
const fetchAuthSession = vi.fn();
const useMyStores = vi.fn();

vi.mock('@/hooks/useMyStores', () => ({
  useMyStores: () => useMyStores(),
}));

vi.mock('@/hooks/useSwitchStore', () => ({
  useSwitchStore: () => ({ mutate: switchMutate, isPending: false }),
}));

vi.mock('@/lib/auth/client-session', () => ({
  fetchAuthSession: () => fetchAuthSession(),
  hasAuthCompanionCookie: () => false,
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const stores = [
  { membershipRole: 'owner', store: { id: 'store-a', name: 'A', status: 'approved' } },
  { membershipRole: 'owner', store: { id: 'store-b', name: 'B', status: 'approved' } },
];

describe('useVendorStoreSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'vendor-1',
        email: 'v@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        storeId: 'store-b',
      },
      isAuthenticated: true,
      hasHydrated: true,
    });
    useVendorStore.setState({ activeStoreId: 'store-b', hasHydrated: true });
    useMyStores.mockReturnValue({ data: stores, isLoading: false });
    fetchAuthSession.mockResolvedValue({
      authenticated: true,
      role: 'vendor',
      storeId: 'store-b',
    });
  });

  it('does not force-switch when persisted store already matches the JWT session', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(() => useVendorStoreSync(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(fetchAuthSession).toHaveBeenCalled();
    });

    expect(switchMutate).not.toHaveBeenCalled();
    expect(useVendorStore.getState().activeStoreId).toBe('store-b');
  });

  it('re-switches to the persisted store when JWT session drifted', async () => {
    fetchAuthSession.mockResolvedValue({
      authenticated: true,
      role: 'vendor',
      storeId: 'store-a',
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(() => useVendorStoreSync(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(switchMutate).toHaveBeenCalledWith('store-b');
    });
  });

  it('aligns local state from JWT when persistence is empty', async () => {
    useVendorStore.setState({ activeStoreId: null, hasHydrated: true });
    useAuthStore.setState({
      user: {
        id: 'vendor-1',
        email: 'v@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        storeId: undefined,
      },
      isAuthenticated: true,
      hasHydrated: true,
    });
    fetchAuthSession.mockResolvedValue({
      authenticated: true,
      role: 'vendor',
      storeId: 'store-a',
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(() => useVendorStoreSync(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(useVendorStore.getState().activeStoreId).toBe('store-a');
    });
    expect(switchMutate).not.toHaveBeenCalled();
  });
});
