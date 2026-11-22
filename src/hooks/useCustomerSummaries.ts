'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomerPurchaseSummary, getStoreCustomerSummary } from '@/lib/api/customer-summaries';
import { queryKeys } from '@/lib/react-query/keys';

const SUMMARY_STALE_TIME = 30 * 1000;

export function useStoreCustomerSummary(storeId: string | undefined, year: number, month: number) {
  return useQuery({
    staleTime: SUMMARY_STALE_TIME,
    queryKey: queryKeys.analytics.storeCustomerSummary(storeId ?? '', year, month),
    queryFn: () => getStoreCustomerSummary(storeId!, year, month),
    enabled: Boolean(storeId),
  });
}

export function useCustomerPurchaseSummary(
  customerId: string | undefined,
  year: number,
  month: number,
) {
  return useQuery({
    staleTime: SUMMARY_STALE_TIME,
    queryKey: queryKeys.analytics.customerPurchaseSummary(customerId ?? '', year, month),
    queryFn: () => getCustomerPurchaseSummary(customerId!, year, month),
    enabled: Boolean(customerId),
  });
}
