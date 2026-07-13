import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '@/lib/api/auth';
import { setTokens } from '@/lib/api/client';
import { getApolloClient } from '@/lib/graphql/client';
import { queryKeys } from '@/lib/react-query/keys';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import { useLogin, useLogout } from './useAuth';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  clearTokens: vi.fn(),
  setTokens: vi.fn(),
}));

vi.mock('@/lib/graphql/client', () => ({
  getApolloClient: vi.fn(),
}));

vi.mock('@/lib/jwt', () => ({
  getStoreIdFromToken: vi.fn(() => 'store-b'),
}));

const vendorB = {
  accessToken: 'token-b',
  refreshToken: 'refresh-b',
  user: {
    id: 'vendor-b',
    email: 'b@test.com',
    fullName: 'Vendor B',
    role: 'vendor',
  },
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAuth session boundaries', () => {
  const clearStore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    replace.mockClear();
    vi.mocked(getApolloClient).mockReturnValue({
      clearStore,
    } as unknown as ReturnType<typeof getApolloClient>);
    vi.mocked(login).mockResolvedValue(vendorB);
    useAuthStore.setState({
      user: { id: 'vendor-a', email: 'a@test.com', fullName: 'Vendor A', role: 'vendor' },
      isAuthenticated: true,
      hasHydrated: true,
    });
    useVendorStore.setState({ activeStoreId: 'store-a', hasHydrated: true });
  });

  it('logout clears vendor-scoped caches and redirects to login', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.stores.myStores(), [{ store: { id: 'store-a' } }]);

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current();
    });

    expect(useAuthStore.getState().user).toBeNull();
    expect(useVendorStore.getState().activeStoreId).toBeNull();
    expect(queryClient.getQueryData(queryKeys.stores.myStores())).toBeUndefined();
    expect(clearStore).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('login success replaces cached vendor data for the new session', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(queryKeys.stores.myStores(), [{ store: { id: 'store-a' } }]);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ email: 'b@test.com', password: 'secret' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setTokens).toHaveBeenCalledWith('token-b', 'refresh-b');
    expect(useAuthStore.getState().user?.email).toBe('b@test.com');
    expect(useVendorStore.getState().activeStoreId).toBe('store-b');
    expect(queryClient.getQueryData(queryKeys.stores.myStores())).toBeUndefined();
    expect(clearStore).toHaveBeenCalledOnce();
  });
});
