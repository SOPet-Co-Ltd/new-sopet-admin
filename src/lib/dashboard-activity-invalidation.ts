import type { QueryClient } from '@tanstack/react-query';
import { DashboardActivityKind } from '@/lib/graphql/generated/graphql';
import { queryKeys } from '@/lib/react-query/keys';

export function invalidateQueriesForDashboardActivity(
  queryClient: QueryClient,
  kind: DashboardActivityKind,
): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

  switch (kind) {
    case DashboardActivityKind.Order:
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      break;
    case DashboardActivityKind.BankTransfer:
      void queryClient.invalidateQueries({ queryKey: queryKeys.bankTransfers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
      break;
    case DashboardActivityKind.StoreRequest:
      void queryClient.invalidateQueries({ queryKey: queryKeys.storeRequests.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
      break;
    case DashboardActivityKind.StoreStatus:
      void queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.storeRequests.all });
      break;
    case DashboardActivityKind.Reactivation:
      void queryClient.invalidateQueries({ queryKey: queryKeys.storeReactivationRequests.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
      break;
    case DashboardActivityKind.Taxonomy:
      void queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
      break;
    case DashboardActivityKind.Payout:
      void queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
      break;
    case DashboardActivityKind.Review:
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      break;
    default:
      break;
  }
}

/** Keys refreshed when the WebSocket reconnects after a gap. */
export function invalidateDashboardCachesOnReconnect(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.bankTransfers.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.storeRequests.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.adminStores.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.storeReactivationRequests.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
}
