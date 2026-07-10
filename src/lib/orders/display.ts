import type { Order, OrderItem, OrderStoreShipping } from '@/types';

export function getOrderCustomerName(order: Order): string {
  if (order.guestName) return order.guestName;
  if (order.shippingAddress?.fullName) return order.shippingAddress.fullName;
  return 'ลูกค้า';
}

export function getOrderCustomerPhone(order: Order): string | undefined {
  return order.guestPhone ?? order.shippingAddress?.phone ?? undefined;
}

export function getOrderCustomerEmail(order: Order): string | undefined {
  return order.guestEmail ?? undefined;
}

export function isGuestOrder(order: Order): boolean {
  return Boolean(order.guestPhone);
}

export function getStoreOrderItems(order: Order, storeId?: string): OrderItem[] {
  if (!storeId) return order.items;
  return order.items.filter((item) => item.storeId === storeId);
}

export function getStoreShipping(order: Order, storeId?: string): OrderStoreShipping | undefined {
  if (!storeId) return order.storeShippings[0];
  return order.storeShippings.find((shipping) => shipping.storeId === storeId);
}

export function sumItemSubtotals(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export function getUniqueStoreIds(order: Order): string[] {
  return [...new Set(order.items.map((item) => item.storeId))];
}

/** Discount attributed to a vendor's store (full amount for single-store orders). */
export function getStoreDiscountAmount(order: Order, storeId?: string): number {
  if (order.discountAmount <= 0) return 0;
  if (!storeId) return order.discountAmount;

  const storeItems = getStoreOrderItems(order, storeId);
  if (storeItems.length === 0) return 0;

  if (getUniqueStoreIds(order).length === 1) {
    return order.discountAmount;
  }

  const storeSubtotal = sumItemSubtotals(storeItems);
  if (order.subtotal <= 0) return 0;

  return Math.round(((order.discountAmount * storeSubtotal) / order.subtotal) * 100) / 100;
}

export function getStoreOrderTotal(order: Order, storeId?: string): number {
  const storeItems = getStoreOrderItems(order, storeId);
  const storeSubtotal = sumItemSubtotals(storeItems);
  const storeShipping = getStoreShipping(order, storeId);
  const storeDiscount = getStoreDiscountAmount(order, storeId);

  return Math.max(storeSubtotal + (storeShipping?.shippingFee ?? 0) - storeDiscount, 0);
}

export function formatShippingAddress(order: Order): string | undefined {
  const address = order.shippingAddress;
  if (!address) return undefined;

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.tumbon,
    address.amphoe,
    address.province,
    address.postalCode,
  ].filter(Boolean);

  return parts.join(' ');
}
