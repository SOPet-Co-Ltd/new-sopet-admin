import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { executeQuery } from '@/lib/graphql/client';
import { getAdminAuditLogs } from '@/lib/api/admin-audit-logs';
import { useAdminAuditLogs } from './useAdminAuditLogs';

vi.mock('@/lib/api/admin-audit-logs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/admin-audit-logs')>();
  return {
    ...actual,
    getAdminAuditLogs: vi.fn(actual.getAdminAuditLogs),
  };
});

vi.mock('@/lib/graphql/client', () => ({
  executeQuery: vi.fn(),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: vi.fn(actual.useQuery),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function setVisibilityState(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useAdminAuditLogs', () => {
  beforeEach(() => {
    vi.mocked(getAdminAuditLogs).mockReset();
    vi.mocked(executeQuery).mockReset();
    vi.mocked(useQuery).mockClear();
    setVisibilityState('visible');
  });

  afterEach(() => {
    setVisibilityState('visible');
  });

  /**
   * AC: AC-F-023 — client fetches paginated audit logs with limit 20.
   * Behavior: renderHook with page/limit → getAdminAuditLogs called; isSuccess with empty items.
   * @category: core-functionality
   * @lane: integration
   * @dependency: useAdminAuditLogs, getAdminAuditLogs mock, QueryClientProvider
   * @complexity: low
   * ROI: 70
   */
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
    expect(getAdminAuditLogs).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  /**
   * AC: AC-F-025/026 — 12s visibility-gated poll; keepPreviousData; background pause.
   * Behavior: Visible → refetchInterval 12000 + keepPreviousData + refetchIntervalInBackground false;
   * hidden → refetchInterval false.
   * @category: core-functionality
   * @lane: integration
   * @dependency: useAdminAuditLogs, useQuery spy, document.visibilityState
   * @complexity: medium
   * ROI: 95
   */
  it('configures 12s visibility-gated poll, keepPreviousData, and background pause', async () => {
    vi.mocked(getAdminAuditLogs).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });

    const { rerender } = renderHook(() => useAdminAuditLogs({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(vi.mocked(useQuery).mock.calls.length).toBeGreaterThan(0));

    const visibleOptions = vi.mocked(useQuery).mock.calls.at(-1)?.[0] as {
      refetchInterval: number | false;
      refetchIntervalInBackground: boolean;
      placeholderData: unknown;
    };

    expect(visibleOptions.refetchInterval).toBe(12_000);
    expect(visibleOptions.refetchIntervalInBackground).toBe(false);
    expect(visibleOptions.placeholderData).toBe(keepPreviousData);

    setVisibilityState('hidden');
    rerender();

    await waitFor(() => {
      const hiddenOptions = vi.mocked(useQuery).mock.calls.at(-1)?.[0] as {
        refetchInterval: number | false;
      };
      expect(hiddenOptions.refetchInterval).toBe(false);
    });
  });

  /**
   * AC: AC-F-027 — no GraphQL subscription for audit logs (query + poll only).
   * Behavior: Artifact scan of hook + documents.ts → no subscription / audit subscription op.
   * @category: core-functionality
   * @lane: integration
   * @dependency: useAdminAuditLogs.ts, lib/graphql/documents.ts
   * @complexity: low
   * ROI: 80
   */
  it('does not open a GraphQL subscription for audit logs', () => {
    const hookDir = dirname(fileURLToPath(import.meta.url));
    const hookSource = readFileSync(join(hookDir, 'useAdminAuditLogs.ts'), 'utf8');
    const documentsSource = readFileSync(join(hookDir, '../lib/graphql/documents.ts'), 'utf8');

    expect(hookSource).not.toMatch(/useSubscription|subscribeToMore|GraphQLWsLink/);
    expect(hookSource).toMatch(/refetchInterval/);
    expect(hookSource).toMatch(/getAdminAuditLogs/);

    const auditSubscription = /subscription[\s\S]{0,200}[Aa]udit/;
    expect(documentsSource).not.toMatch(auditSubscription);
  });
});

describe('getAdminAuditLogs filter omit-empty', () => {
  beforeEach(() => {
    vi.mocked(executeQuery).mockResolvedValue({
      adminAuditLogs: {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      },
    });
  });

  /**
   * AC: empty-input Failure Mode — empty filters omit GraphQL filter fields (including requestId).
   * Behavior: Call getAdminAuditLogs with blank strings → executeQuery filter is undefined.
   * @category: edge-case
   * @lane: integration
   * @dependency: getAdminAuditLogs, executeQuery mock
   * @complexity: low
   * ROI: 75
   */
  it('omits empty filter fields and optional requestId when blank', async () => {
    const { getAdminAuditLogs: realGet } = await vi.importActual<
      typeof import('@/lib/api/admin-audit-logs')
    >('@/lib/api/admin-audit-logs');

    await realGet({
      page: 1,
      limit: 20,
      search: '',
      action: '',
      resourceType: '',
      fromDate: '',
      toDate: '',
      requestId: '',
    });

    expect(executeQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        page: 1,
        limit: 20,
        filter: undefined,
      }),
    );
  });

  /**
   * AC: Field Propagation / AC-F-033 — non-empty filter fields including requestId are sent.
   * Behavior: Call with search + requestId → executeQuery filter contains only those keys.
   * @category: core-functionality
   * @lane: integration
   * @dependency: getAdminAuditLogs, executeQuery mock
   * @complexity: low
   * ROI: 78
   */
  it('includes only non-empty filter fields including requestId', async () => {
    const { getAdminAuditLogs: realGet } = await vi.importActual<
      typeof import('@/lib/api/admin-audit-logs')
    >('@/lib/api/admin-audit-logs');

    await realGet({
      page: 2,
      limit: 20,
      search: 'pet',
      requestId: 'req-123',
    });

    expect(executeQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        page: 2,
        limit: 20,
        filter: { search: 'pet', requestId: 'req-123' },
      }),
    );
  });
});
