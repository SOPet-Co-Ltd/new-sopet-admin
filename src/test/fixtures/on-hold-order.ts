import type { Order, OrderItem } from '@/types';

export function createHoldOrderItem(
  overrides: Partial<OrderItem> & Pick<OrderItem, 'id' | 'storeId'> = {
    id: 'item-hold-1',
    storeId: 'store-1',
  },
): OrderItem {
  return {
    productName: 'Held Product',
    quantity: 1,
    unitPrice: 250,
    subtotal: 250,
    fulfillmentStatus: 'on_hold',
    ...overrides,
  } as OrderItem;
}

/** Full-hold order fixture for admin/vendor Vitest (order + item on_hold). */
export function createOnHoldOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-hold-1',
    orderNumber: 'ORD-HOLD-001',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    total: 250,
    subtotal: 250,
    shippingFee: 0,
    discountAmount: 0,
    paymentMethod: 'promptpay',
    status: 'on_hold',
    items: [createHoldOrderItem()],
    storeShippings: [],
    ...overrides,
  } as Order;
}
