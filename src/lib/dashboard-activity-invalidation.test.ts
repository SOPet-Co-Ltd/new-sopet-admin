import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { DashboardActivityKind } from '@/lib/graphql/generated/graphql';
import { queryKeys } from '@/lib/react-query/keys';
import {
  invalidateDashboardCachesOnReconnect,
  invalidateQueriesForDashboardActivity,
} from './dashboard-activity-invalidation';

describe('invalidateQueriesForDashboardActivity', () => {
  it('invalidates orders and adminOrders for ORDER events', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    invalidateQueriesForDashboardActivity(queryClient, DashboardActivityKind.Order);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.notifications.all });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.adminOrders.all });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.analytics.all });
    expect(invalidateQueries).not.toHaveBeenCalledWith({ queryKey: queryKeys.products.all });
  });

  it('invalidates store request keys for STORE_REQUEST events', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    invalidateQueriesForDashboardActivity(queryClient, DashboardActivityKind.StoreRequest);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.storeRequests.all });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.stores.all });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.adminStores.all });
  });
});

describe('invalidateDashboardCachesOnReconnect', () => {
  it('invalidates the shared dashboard query roots', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    invalidateDashboardCachesOnReconnect(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.orders.all });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.adminOrders.all });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.notifications.all });
  });
});
