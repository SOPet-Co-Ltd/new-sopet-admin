import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getAdminAuditLogs } from '@/lib/api/admin-audit-logs';
import { useAdminAuditLogs } from './useAdminAuditLogs';

vi.mock('@/lib/api/admin-audit-logs', () => ({
  getAdminAuditLogs: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAdminAuditLogs', () => {
  it('fetches paginated audit logs', async () => {
    vi.mocked(getAdminAuditLogs).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    const { result } = renderHook(() => useAdminAuditLogs({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pagination.total).toBe(0);
  });
});
