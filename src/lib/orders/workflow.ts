import type { Order, OrderItem } from '@/types';

export type VendorOrderWorkflowAction =
  'mark_paid' | 'acknowledge' | 'ship' | 'awaiting_customer' | 'completed' | 'none';

export function getStoreOrderItems(order: Order, storeId?: string): OrderItem[] {
  if (!storeId) return order.items;
  return order.items.filter((item) => item.storeId === storeId);
}

export function getVendorOrderWorkflowAction(
  order: Order,
  storeId?: string,
): VendorOrderWorkflowAction {
  const storeItems = getStoreOrderItems(order, storeId);
  if (storeItems.length === 0) return 'none';

  if (order.status === 'cancelled' || order.status === 'refunded' || order.status === 'delivered') {
    return order.status === 'delivered' ? 'completed' : 'none';
  }

  if (order.status === 'pending_payment') {
    return 'mark_paid';
  }

  const fulfillmentStatuses = storeItems.map((item) => item.fulfillmentStatus);

  if (fulfillmentStatuses.every((status) => status === 'delivered')) {
    return 'completed';
  }

  if (fulfillmentStatuses.every((status) => status === 'shipped' || status === 'delivered')) {
    return 'awaiting_customer';
  }

  if (fulfillmentStatuses.every((status) => status === 'processing')) {
    return 'ship';
  }

  if (
    order.status === 'paid' ||
    order.status === 'processing' ||
    fulfillmentStatuses.every((status) => status === 'pending')
  ) {
    return 'acknowledge';
  }

  return 'none';
}

export function getStoreTrackingUrl(order: Order, storeId?: string): string | undefined {
  return getStoreShipmentInfo(order, storeId)?.trackingUrl;
}

export type StoreShipmentInfo = {
  trackingNumber?: string;
  fulfillmentProvider?: string;
  trackingUrl?: string;
};

export function getStoreShipmentInfo(
  order: Order,
  storeId?: string,
): StoreShipmentInfo | undefined {
  const storeItems = getStoreOrderItems(order, storeId);
  const shippedItem = storeItems.find(
    (item) =>
      item.trackingNumber ||
      item.fulfillmentProvider ||
      item.trackingUrl ||
      item.fulfillmentStatus === 'shipped' ||
      item.fulfillmentStatus === 'delivered',
  );

  if (!shippedItem) {
    return undefined;
  }

  return {
    trackingNumber: shippedItem.trackingNumber ?? undefined,
    fulfillmentProvider: shippedItem.fulfillmentProvider ?? undefined,
    trackingUrl: shippedItem.trackingUrl ?? undefined,
  };
}

const VENDOR_CANCELLABLE_STATUSES = new Set(['pending_payment', 'paid', 'processing']);

export function canVendorCancelOrder(order: Order, storeId?: string): boolean {
  if (!storeId || !VENDOR_CANCELLABLE_STATUSES.has(order.status)) {
    return false;
  }

  const storeItems = getStoreOrderItems(order, storeId);
  if (storeItems.length === 0) {
    return false;
  }

  const storeIds = new Set(order.items.map((item) => item.storeId));
  return storeIds.size === 1 && storeIds.has(storeId);
}

export function vendorCancelWillRefund(order: Order): boolean {
  return order.status !== 'pending_payment' && order.paymentMethod !== 'cod';
}
