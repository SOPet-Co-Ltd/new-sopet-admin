import { executeQuery } from '@/lib/graphql/client';
import { TOP_PRODUCTS_QUERY } from '@/lib/graphql/documents';
import { mapTopProduct } from '@/lib/graphql/mappers';
import type { TopProduct } from '@/types';

type GqlTopProduct = Parameters<typeof mapTopProduct>[0];

export function getTopProducts(storeId: string, limit = 5): Promise<TopProduct[]> {
  return executeQuery<{ topProducts: GqlTopProduct[] }>(TOP_PRODUCTS_QUERY, {
    storeId,
    limit,
  }).then((data) => data.topProducts.map(mapTopProduct));
}
