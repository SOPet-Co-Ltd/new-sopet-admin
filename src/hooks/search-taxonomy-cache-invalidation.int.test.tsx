import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { queryKeys } from '@/lib/react-query/keys';

const approveCategoryMock = vi.fn();
const cacheResetMock = vi.fn();

vi.mock('@/lib/api/taxonomy', () => ({
  approveCategory: (...args: unknown[]) => approveCategoryMock(...args),
  rejectCategory: vi.fn(),
  deleteCategory: vi.fn(),
  createCategory: vi.fn(),
  createTag: vi.fn(),
  setCategoryImage: vi.fn(),
  setPetTypeImage: vi.fn(),
}));

vi.mock('@/lib/graphql/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/graphql/client')>();
  return {
    ...actual,
    getApolloClient: () => ({
      cache: {
        reset: cacheResetMock,
      },
    }),
  };
});

import { useApproveCategory } from './useTaxonomy';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

  return {
    queryClient,
    invalidateSpy,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe('search taxonomy cache invalidation integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    approveCategoryMock.mockResolvedValue({
      id: 'cat-1',
      name: 'Test',
      slug: 'test',
      status: 'approved',
    });
  });

  it('invalidates targeted keys for approveCategory without cache.reset (AC-040)', async () => {
    const { wrapper, invalidateSpy } = createWrapper();
    const { result } = renderHook(() => useApproveCategory(), { wrapper });

    result.current.mutate('cat-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.taxonomy.approvedCategories(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.taxonomy.pendingCategories(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.taxonomy.rejectedCategories(),
    });
    expect(invalidateSpy).not.toHaveBeenCalledWith({
      queryKey: queryKeys.taxonomy.all,
    });
    expect(cacheResetMock).not.toHaveBeenCalled();
  });
});
