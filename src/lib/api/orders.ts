import { executeMutation, executeQuery } from '@/lib/graphql/client';
import { UPDATE_ORDER_STATUS, VENDOR_ORDERS_QUERY } from '@/lib/graphql/documents';
import { mapOrder } from '@/lib/graphql/mappers';
import type { Order, UpdateOrderStatusInput } from '@/types';

export function getVendorOrders(): Promise<Order[]> {
  return executeQuery<{ vendorOrders: Parameters<typeof mapOrder>[0][] }>(VENDOR_ORDERS_QUERY).then(
    (data) => data.vendorOrders.map(mapOrder),
  );
}

export function updateOrderStatus(input: UpdateOrderStatusInput): Promise<Order> {
  return executeMutation<{ updateOrderStatus: Parameters<typeof mapOrder>[0] }>(
    UPDATE_ORDER_STATUS,
    { input },
  ).then((data) => mapOrder(data.updateOrderStatus));
}
