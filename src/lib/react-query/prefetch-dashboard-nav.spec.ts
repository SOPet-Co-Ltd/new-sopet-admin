import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { prefetchDashboardNav } from '@/lib/react-query/prefetch-dashboard-nav';
import { queryKeys } from '@/lib/react-query/keys';

vi.mock('@/lib/api/admin-stores', () => ({
  getAdminStores: vi.fn(async () => []),
}));

import { getAdminStores } from '@/lib/api/admin-stores';

describe('prefetchDashboardNav', () => {
  it('prefetches the admin stores list with the matching query key', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery');

    prefetchDashboardNav(queryClient, '/admin/stores');

    expect(prefetchSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.adminStores.list(),
      queryFn: getAdminStores,
    });

    await queryClient.fetchQuery({
      queryKey: queryKeys.adminStores.list(),
      queryFn: getAdminStores,
    });

    prefetchSpy.mockClear();
    prefetchDashboardNav(queryClient, '/admin/stores');

    expect(prefetchSpy).toHaveBeenCalledTimes(1);
  });
});
