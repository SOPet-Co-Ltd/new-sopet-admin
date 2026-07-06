import { executeQuery } from '@/lib/graphql/client';
import { STORE_ANALYTICS_QUERY } from '@/lib/graphql/documents';
import { mapStoreAnalytics } from '@/lib/graphql/mappers';
import type { StoreAnalytics } from '@/types';

export function getStoreAnalytics(
  storeId: string,
  fromDate?: string,
  toDate?: string,
): Promise<StoreAnalytics> {
  return executeQuery<{
    storeAnalytics: Parameters<typeof mapStoreAnalytics>[0];
  }>(STORE_ANALYTICS_QUERY, { storeId, fromDate, toDate }).then((data) =>
    mapStoreAnalytics(data.storeAnalytics),
  );
}
