import { getStoreOrderItems } from '@/lib/orders/display';
import type { Order } from '@/types';
import type { TopProduct } from '@/types';

const EXCLUDED_ORDER_STATUSES = new Set(['cancelled', 'refunded']);

export function computeTopProductsFromOrders(
  orders: Order[],
  storeId: string,
  limit = 5,
): TopProduct[] {
  const buckets = new Map<string, TopProduct>();

  for (const order of orders) {
    if (EXCLUDED_ORDER_STATUSES.has(order.status)) {
      continue;
    }

    for (const item of getStoreOrderItems(order, storeId)) {
      const key = item.productName.trim().toLowerCase();
      const existing = buckets.get(key);

      if (existing) {
        existing.totalSold += item.quantity;
        existing.revenue += item.subtotal;
        continue;
      }

      buckets.set(key, {
        productId: key,
        productName: item.productName,
        totalSold: item.quantity,
        revenue: item.subtotal,
      });
    }
  }

  return [...buckets.values()]
    .sort((left, right) => right.revenue - left.revenue || right.totalSold - left.totalSold)
    .slice(0, limit);
}
