'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getPlatformAnalytics,
  getPlatformSalesByCategory,
  getPlatformSalesByPaymentMethod,
  getPlatformSalesOverTime,
  getPlatformTopProducts,
  getPlatformTopStores,
} from '@/lib/api/platform-analytics';
import { queryKeys } from '@/lib/react-query/keys';

export function usePlatformAnalytics(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.platform(fromDate, toDate),
    queryFn: () => getPlatformAnalytics(fromDate, toDate),
  });
}

export function usePlatformSalesOverTime(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.platformSalesOverTime(fromDate, toDate),
    queryFn: () => getPlatformSalesOverTime(fromDate, toDate),
  });
}

export function usePlatformSalesByPayment(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: queryKeys.analytics.platformSalesByPayment(fromDate, toDate),
    queryFn: () => getPlatformSalesByPaymentMethod(fromDate, toDate),
  });
}

export function usePlatformSalesByCategory(fromDate?: string, toDate?: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.analytics.platformSalesByCategory(fromDate, toDate, limit),
    queryFn: () => getPlatformSalesByCategory(fromDate, toDate, limit),
  });
}

export function usePlatformTopProducts(limit = 10) {
  return useQuery({
    queryKey: queryKeys.analytics.platformTopProducts(limit),
    queryFn: () => getPlatformTopProducts(limit),
  });
}

export function usePlatformTopStores(limit = 10) {
  return useQuery({
    queryKey: queryKeys.analytics.platformTopStores(limit),
    queryFn: () => getPlatformTopStores(limit),
  });
}
