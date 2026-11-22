import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ACKNOWLEDGE_VENDOR_ORDER,
  CANCEL_VENDOR_ORDER,
  MARK_VENDOR_ORDER_PAID,
  SHIP_VENDOR_ORDER,
  UPDATE_ORDER_STATUS,
  VENDOR_ORDER_QUERY,
  VENDOR_ORDERS_QUERY,
} from '@/lib/graphql/documents';
import { mapOrder } from '@/lib/graphql/mappers';
import type { Order, Paginated, UpdateOrderStatusInput } from '@/types';

export const VENDOR_ORDERS_PAGE_SIZE = 20;

export type VendorOrdersQueue = 'ALL' | 'ACTION';

export type VendorOrdersQueryParams = {
  storeId: string;
  page?: number;
  limit?: number;
  queue?: VendorOrdersQueue;
  status?: string;
  paymentMethod?: string;
  search?: string;
};

export type VendorOrdersResult = Paginated<Order> & {
  actionableCount: number;
};

export function getVendorOrders(params: VendorOrdersQueryParams): Promise<VendorOrdersResult> {
  const {
    storeId,
    page = 1,
    limit = VENDOR_ORDERS_PAGE_SIZE,
    queue,
    status,
    paymentMethod,
    search,
  } = params;

  return executeQuery<{
    vendorOrders: {
      items: Parameters<typeof mapOrder>[0][];
      pagination: VendorOrdersResult['pagination'];
      actionableCount: number;
    };
  }>(VENDOR_ORDERS_QUERY, {
    storeId,
    page,
    limit,
    queue: queue ?? 'ALL',
    status: status || undefined,
    paymentMethod: paymentMethod || undefined,
    search: search?.trim() || undefined,
  }).then((data) => ({
    items: data.vendorOrders.items.map(mapOrder),
    pagination: data.vendorOrders.pagination,
    actionableCount: data.vendorOrders.actionableCount,
  }));
}

export function getVendorOrder(storeId: string, id: string): Promise<Order> {
  return executeQuery<{ vendorOrder: Parameters<typeof mapOrder>[0] }>(VENDOR_ORDER_QUERY, {
    storeId,
    id,
  }).then((data) => mapOrder(data.vendorOrder));
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
