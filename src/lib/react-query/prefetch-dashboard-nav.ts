import type { QueryClient } from '@tanstack/react-query';
import { getAdminCustomers } from '@/lib/api/admin-customers';
import { getAdminStore, getAdminStores } from '@/lib/api/admin-stores';
import { getAdminVendors } from '@/lib/api/admin-vendors';
import { getProduct, getVendorProducts } from '@/lib/api/products';
import { getVendorOrders } from '@/lib/api/orders';
import { getMyStores } from '@/lib/api/stores';
import { getPlatformAnalytics, getPlatformSalesOverTime } from '@/lib/api/platform-analytics';
import { getPendingCategories } from '@/lib/api/taxonomy';
import { getAdminTeamMembers } from '@/lib/api/adminTeam';
import { getPlatformPromotions } from '@/lib/api/promotions';
import { getNotifications } from '@/lib/api/notifications';
import { queryKeys } from '@/lib/react-query/keys';

type NavPrefetchTarget = {
  queryKey: readonly unknown[];
  queryFn: () => Promise<unknown>;
};

const DEFAULT_CUSTOMER_LIST_PARAMS = { page: 1, limit: 20 };
const DEFAULT_VENDOR_PRODUCT_PARAMS = { page: 1, limit: 10 };

const NAV_PREFETCH_TARGETS: Record<string, NavPrefetchTarget> = {
  '/admin/analytics': {
    queryKey: queryKeys.analytics.platform(),
    queryFn: () => getPlatformAnalytics(),
  },
  '/admin/stores': {
    queryKey: queryKeys.adminStores.list(),
    queryFn: getAdminStores,
  },
  '/admin/vendors': {
    queryKey: queryKeys.adminVendors.list(),
    queryFn: () => getAdminVendors(),
  },
  '/admin/customers': {
    queryKey: queryKeys.adminCustomers.list(DEFAULT_CUSTOMER_LIST_PARAMS),
    queryFn: () => getAdminCustomers(DEFAULT_CUSTOMER_LIST_PARAMS),
  },
  '/admin/taxonomy': {
    queryKey: queryKeys.taxonomy.pendingCategories(),
    queryFn: getPendingCategories,
  },
  '/admin/promotions': {
    queryKey: queryKeys.promotions.platform(),
    queryFn: getPlatformPromotions,
  },
  '/admin/team': {
    queryKey: queryKeys.adminTeam.members(),
    queryFn: getAdminTeamMembers,
  },
  '/admin/notifications': {
    queryKey: queryKeys.notifications.list(),
    queryFn: () => getNotifications(),
  },
  '/vendor/stores': {
    queryKey: queryKeys.stores.myStores(),
    queryFn: getMyStores,
  },
  '/vendor/orders': {
    queryKey: queryKeys.orders.vendor(),
    queryFn: getVendorOrders,
  },
  '/vendor/products': {
    queryKey: queryKeys.products.list(DEFAULT_VENDOR_PRODUCT_PARAMS),
    queryFn: () => getVendorProducts(DEFAULT_VENDOR_PRODUCT_PARAMS),
  },
};

export function prefetchDashboardNav(queryClient: QueryClient, href: string): void {
  const target = NAV_PREFETCH_TARGETS[href];
  if (!target) return;

  void queryClient.prefetchQuery({
    queryKey: target.queryKey,
    queryFn: target.queryFn,
  });

  if (href === '/admin/analytics') {
    prefetchAnalyticsCharts(queryClient);
  }
}

export function prefetchAdminStoreDetail(queryClient: QueryClient, storeId: string): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.adminStores.detail(storeId),
    queryFn: () => getAdminStore(storeId),
  });
}

export function prefetchVendorProductDetail(queryClient: QueryClient, productId: string): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => getProduct(productId),
  });
}

export function createDashboardNavPrefetchHandlers(
  queryClient: QueryClient,
  href: string,
): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  const prefetch = () => prefetchDashboardNav(queryClient, href);
  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

export function createDetailPrefetchHandlers(prefetch: () => void): {
  onMouseEnter: () => void;
  onFocus: () => void;
} {
  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

// Analytics landing also warms the primary chart query used on first paint.
export function prefetchAnalyticsCharts(queryClient: QueryClient): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.analytics.platformSalesOverTime(),
    queryFn: () => getPlatformSalesOverTime(),
  });
}
