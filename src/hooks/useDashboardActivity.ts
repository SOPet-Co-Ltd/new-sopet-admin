'use client';

import { useEffect } from 'react';
import { useSubscription } from '@apollo/client/react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardActivityDocument } from '@/lib/graphql/generated/graphql';
import { subscribeWsReconnect } from '@/lib/graphql/client';
import {
  invalidateDashboardCachesOnReconnect,
  invalidateQueriesForDashboardActivity,
} from '@/lib/dashboard-activity-invalidation';

function isDocumentVisible(): boolean {
  return typeof document === 'undefined' || document.visibilityState === 'visible';
}

/**
 * Subscribes to authenticated dashboardActivity and invalidates matching TanStack caches.
 * Mount once in DashboardShell for both admin and vendor layouts.
 */
export function useDashboardActivity(enabled = true): void {
  const queryClient = useQueryClient();

  useSubscription(DashboardActivityDocument, {
    skip: !enabled,
    onData: ({ data }) => {
      const activity = data.data?.dashboardActivity;
      if (!activity || !isDocumentVisible()) {
        return;
      }
      invalidateQueriesForDashboardActivity(queryClient, activity.kind);
    },
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    return subscribeWsReconnect(() => {
      if (!isDocumentVisible()) {
        return;
      }
      invalidateDashboardCachesOnReconnect(queryClient);
    });
  }, [enabled, queryClient]);
}
