import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useApprovedCategories } from '@/hooks/useTaxonomy';
import { useMyStores } from '@/hooks/useMyStores';
import { useMyStore } from '@/hooks/useStoreSettings';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { queryKeys } from '@/lib/react-query/keys';

vi.mock('@/lib/api/taxonomy', () => ({
  getApprovedCategories: vi.fn(async () => []),
}));

vi.mock('@/lib/api/stores', () => ({
  getMyStores: vi.fn(async () => []),
  getMyStore: vi.fn(async () => ({ id: 'store-1', name: 'Store' })),
}));

vi.mock('@/lib/api/orders', () => ({
  getVendorOrders: vi.fn(async () => ({
    items: [],
    pagination: { page: 1, total: 0, totalPages: 0 },
  })),
}));

const GLOBAL_STALE_TIME = 60 * 1000;

function getStaleTime(queryClient: QueryClient, queryKey: readonly unknown[]) {
  const query = queryClient.getQueryCache().find({ queryKey });
  return (query?.options as { staleTime?: number } | undefined)?.staleTime;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('per-query staleTime tuning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('configures taxonomy queries with a longer staleTime than the global default', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: GLOBAL_STALE_TIME } },
    });

    renderHook(() => useApprovedCategories(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(getStaleTime(queryClient, queryKeys.taxonomy.approvedCategories())).toBe(
        5 * 60 * 1000,
      );
    });
    expect(getStaleTime(queryClient, queryKeys.taxonomy.approvedCategories())).toBeGreaterThan(
      GLOBAL_STALE_TIME,
    );
  });

  it('configures store settings and my stores with a 2-minute staleTime', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: GLOBAL_STALE_TIME } },
    });

    renderHook(() => useMyStores(), { wrapper: createWrapper(queryClient) });
    renderHook(() => useMyStore(), { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(getStaleTime(queryClient, queryKeys.stores.myStores())).toBe(2 * 60 * 1000);
      expect(getStaleTime(queryClient, queryKeys.stores.detail('current'))).toBe(2 * 60 * 1000);
    });
  });

  it('configures vendor orders with staleTime 0 for fresh status reads', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: GLOBAL_STALE_TIME } },
    });

    renderHook(() => useVendorOrders('store-1'), { wrapper: createWrapper(queryClient) });

    await waitFor(() => {
      expect(getStaleTime(queryClient, queryKeys.orders.vendor('store-1'))).toBe(0);
    });
  });
});
