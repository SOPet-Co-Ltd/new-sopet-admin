import { describe, expect, it } from 'vitest';
import { filterVendorActionableOrders, isVendorActionableOrder } from './vendor-action-queue';
import type { Order } from '@/types';

function createOrder(overrides: Partial<Order> & Pick<Order, 'status' | 'items'>): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-001',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    total: 100,
    subtotal: 100,
    shippingFee: 0,
    discountAmount: 0,
    paymentMethod: 'promptpay',
    ...overrides,
  } as Order;
}

describe('vendor-action-queue', () => {
  it('includes paid orders awaiting acknowledgment', () => {
    const order = createOrder({
      status: 'paid',
      items: [
        {
          id: 'item-1',
          storeId: 'store-1',
          fulfillmentStatus: 'pending',
        } as Order['items'][number],
      ],
    });

    expect(isVendorActionableOrder(order, 'store-1')).toBe(true);
  });

  it('excludes delivered orders', () => {
    const order = createOrder({
      status: 'delivered',
      items: [
        {
          id: 'item-1',
          storeId: 'store-1',
          fulfillmentStatus: 'delivered',
        } as Order['items'][number],
      ],
    });

    expect(isVendorActionableOrder(order, 'store-1')).toBe(false);
  });

  it('sorts actionable orders oldest first', () => {
    const older = createOrder({
      id: 'older',
      createdAt: '2026-01-01T08:00:00.000Z',
      status: 'paid',
      items: [
        {
          id: 'item-1',
          storeId: 'store-1',
          fulfillmentStatus: 'pending',
        } as Order['items'][number],
      ],
    });
    const newer = createOrder({
      id: 'newer',
      createdAt: '2026-01-01T12:00:00.000Z',
      status: 'paid',
      items: [
        {
          id: 'item-2',
          storeId: 'store-1',
          fulfillmentStatus: 'pending',
        } as Order['items'][number],
      ],
    });

    expect(
      filterVendorActionableOrders([newer, older], 'store-1').map((order) => order.id),
    ).toEqual(['older', 'newer']);
  });
});
