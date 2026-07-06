import { executeQuery } from '@/lib/graphql/client';
import {
  PLATFORM_ANALYTICS_QUERY,
  PLATFORM_SALES_BY_CATEGORY_QUERY,
  PLATFORM_SALES_BY_PAYMENT_QUERY,
  PLATFORM_SALES_OVER_TIME_QUERY,
  PLATFORM_TOP_PRODUCTS_QUERY,
  PLATFORM_TOP_STORES_QUERY,
} from '@/lib/graphql/documents';
import {
  mapPlatformAnalytics,
  mapSalesBreakdownItem,
  mapSalesTimePoint,
  mapTopProduct,
  mapTopStore,
} from '@/lib/graphql/mappers';
import type {
  PlatformAnalytics,
  SalesBreakdownItem,
  SalesTimePoint,
  TopProduct,
  TopStore,
} from '@/types';

export function getPlatformAnalytics(
  fromDate?: string,
  toDate?: string,
): Promise<PlatformAnalytics> {
  return executeQuery<{
    platformAnalytics: Parameters<typeof mapPlatformAnalytics>[0];
  }>(PLATFORM_ANALYTICS_QUERY, { fromDate, toDate }).then((data) =>
    mapPlatformAnalytics(data.platformAnalytics),
  );
}

export function getPlatformSalesOverTime(
  fromDate?: string,
  toDate?: string,
): Promise<SalesTimePoint[]> {
  return executeQuery<{
    platformSalesOverTime: Parameters<typeof mapSalesTimePoint>[0][];
  }>(PLATFORM_SALES_OVER_TIME_QUERY, { fromDate, toDate }).then((data) =>
    data.platformSalesOverTime.map(mapSalesTimePoint),
  );
}

export function getPlatformSalesByPaymentMethod(
  fromDate?: string,
  toDate?: string,
): Promise<SalesBreakdownItem[]> {
  return executeQuery<{
    platformSalesByPaymentMethod: Parameters<typeof mapSalesBreakdownItem>[0][];
  }>(PLATFORM_SALES_BY_PAYMENT_QUERY, { fromDate, toDate }).then((data) =>
    data.platformSalesByPaymentMethod.map(mapSalesBreakdownItem),
  );
}

export function getPlatformSalesByCategory(
  fromDate?: string,
  toDate?: string,
  limit = 10,
): Promise<SalesBreakdownItem[]> {
  return executeQuery<{
    platformSalesByCategory: Parameters<typeof mapSalesBreakdownItem>[0][];
  }>(PLATFORM_SALES_BY_CATEGORY_QUERY, { fromDate, toDate, limit }).then((data) =>
    data.platformSalesByCategory.map(mapSalesBreakdownItem),
  );
}

export function getPlatformTopProducts(limit = 10): Promise<TopProduct[]> {
  return executeQuery<{
    platformTopProducts: Parameters<typeof mapTopProduct>[0][];
  }>(PLATFORM_TOP_PRODUCTS_QUERY, { limit }).then((data) =>
    data.platformTopProducts.map(mapTopProduct),
  );
}

export function getPlatformTopStores(limit = 10): Promise<TopStore[]> {
  return executeQuery<{
    platformTopStores: Parameters<typeof mapTopStore>[0][];
  }>(PLATFORM_TOP_STORES_QUERY, { limit }).then((data) => data.platformTopStores.map(mapTopStore));
}
