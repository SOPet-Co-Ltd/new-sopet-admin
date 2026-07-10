import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ACKNOWLEDGE_VENDOR_ORDER,
  CANCEL_VENDOR_ORDER,
  MARK_VENDOR_ORDER_PAID,
  SHIP_VENDOR_ORDER,
  UPDATE_ORDER_STATUS,
  VENDOR_ORDERS_QUERY,
} from '@/lib/graphql/documents';
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

export function markVendorOrderPaid(orderId: string): Promise<Order> {
  return executeMutation<{ markVendorOrderPaid: Parameters<typeof mapOrder>[0] }>(
    MARK_VENDOR_ORDER_PAID,
    { orderId },
  ).then((data) => mapOrder(data.markVendorOrderPaid));
}

export function acknowledgeVendorOrder(orderId: string): Promise<Order> {
  return executeMutation<{ acknowledgeVendorOrder: Parameters<typeof mapOrder>[0] }>(
    ACKNOWLEDGE_VENDOR_ORDER,
    { orderId },
  ).then((data) => mapOrder(data.acknowledgeVendorOrder));
}

export type ShipVendorOrderInput = {
  orderId: string;
  trackingNumber: string;
  fulfillmentProvider: string;
  trackingUrl?: string | null;
};

export function shipVendorOrder(input: ShipVendorOrderInput): Promise<Order> {
  return executeMutation<{ shipVendorOrder: Parameters<typeof mapOrder>[0] }>(SHIP_VENDOR_ORDER, {
    input,
  }).then((data) => mapOrder(data.shipVendorOrder));
}

export function cancelVendorOrder(orderId: string): Promise<Order> {
  return executeMutation<{ cancelVendorOrder: Parameters<typeof mapOrder>[0] }>(
    CANCEL_VENDOR_ORDER,
    { orderId },
  ).then((data) => mapOrder(data.cancelVendorOrder));
}
