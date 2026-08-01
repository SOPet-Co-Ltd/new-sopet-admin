import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  MarkNotificationReadDocument,
  MarkAllNotificationsReadDocument,
} from '@/lib/graphql/generated/graphql';
import { useMarkNotificationRead, useMarkAllNotificationsRead } from './useNotifications';

// QA-hunt regression: the unread-count badge in admin/vendor layouts is driven by a
// completely separate TanStack Query cache (`@/hooks/useUnreadCount`) than the notifications
// page's Apollo cache. Marking a notification read only refetched Apollo's own active
// queries, leaving the badge stale until its own next poll/mount - these mutations must also
// invalidate the TanStack `notifications` query key so the badge updates immediately.
function renderWithProviders(hook: () => unknown, mocks: unknown[]) {
  const queryClient = new QueryClient();
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

  function wrapper({ children }: { children: ReactNode }) {
    return (
      <MockedProvider mocks={mocks as never}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </MockedProvider>
    );
  }

  const rendered = renderHook(hook, { wrapper });
  return { ...rendered, invalidateSpy };
}

describe('useMarkNotificationRead', () => {
  it('invalidates the TanStack notifications cache (unread badge) after marking read', async () => {
    const mocks = [
      {
        request: { query: MarkNotificationReadDocument, variables: { id: 'n-1' } },
        result: { data: { markNotificationRead: true } },
      },
    ];

    const { result, invalidateSpy } = renderWithProviders(() => useMarkNotificationRead(), mocks);
    const [markRead] = result.current as [
      (vars: { variables: { id: string } }) => Promise<unknown>,
    ];

    await act(async () => {
      await markRead({ variables: { id: 'n-1' } });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['notifications'] }),
      );
    });
  });
});

describe('useMarkAllNotificationsRead', () => {
  it('invalidates the TanStack notifications cache (unread badge) after marking all read', async () => {
    const mocks = [
      {
        request: { query: MarkAllNotificationsReadDocument },
        result: { data: { markAllNotificationsRead: true } },
      },
    ];

    const { result, invalidateSpy } = renderWithProviders(
      () => useMarkAllNotificationsRead(),
      mocks,
    );
    const [markAllRead] = result.current as [() => Promise<unknown>];

    await act(async () => {
      await markAllRead();
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['notifications'] }),
      );
    });
  });
});
