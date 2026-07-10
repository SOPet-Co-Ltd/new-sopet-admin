import { describe, expect, it } from 'vitest';
import {
  computeStoreAnalyticsSnapshot,
  computeStoreSalesByPayment,
  computeStoreSalesOverTime,
} from '@/lib/orders/store-analytics';
import type { Order } from '@/types';

function createOrder(overrides: Partial<Order> & Pick<Order, 'status' | 'items'>): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-001',
    createdAt: '2026-07-10T10:00:00.000Z',
    subtotal: 1000,
    shippingFee: 50,
    discountAmount: 100,
    total: 950,
    paymentMethod: 'promptpay',
    storeShippings: [{ storeId: 'store-1', optionName: 'Kerry', shippingFee: 50 }],
    ...overrides,
  };
}

describe('computeStoreAnalyticsSnapshot', () => {
  it('calculates net revenue, discounts, and shipping for the active store', () => {
    const orders = [
      createOrder({
        status: 'paid',
        items: [
          {
            id: 'item-1',
            storeId: 'store-1',
            productName: 'Pet Shampoo 500ml',
            unitPrice: 250,
            quantity: 2,
            subtotal: 500,
            fulfillmentStatus: 'pending',
          },
        ],
      }),
      createOrder({
        status: 'delivered',
        items: [
          {
            id: 'item-2',
            storeId: 'store-1',
            productName: 'Pet Shampoo 500ml',
            unitPrice: 250,
            quantity: 3,
            subtotal: 750,
            fulfillmentStatus: 'delivered',
          },
        ],
      }),
    ];

    const snapshot = computeStoreAnalyticsSnapshot(orders, 'store-1', 'all');

    expect(snapshot.grossRevenue).toBe(1250);
    expect(snapshot.discountAmount).toBe(200);
    expect(snapshot.shippingRevenue).toBe(100);
    expect(snapshot.netRevenue).toBe(1150);
    expect(snapshot.orderCount).toBe(2);
    expect(snapshot.unitsSold).toBe(5);
    expect(snapshot.averageOrderValue).toBe(575);
  });

  it('excludes cancelled orders from analytics', () => {
    const orders = [
      createOrder({
        status: 'cancelled',
        items: [
          {
            id: 'item-1',
            storeId: 'store-1',
            productName: 'Pet Shampoo 500ml',
            unitPrice: 250,
            quantity: 10,
            subtotal: 2500,
            fulfillmentStatus: 'cancelled',
          },
        ],
      }),
    ];

    const snapshot = computeStoreAnalyticsSnapshot(orders, 'store-1', 'all');

    expect(snapshot.netRevenue).toBe(0);
    expect(snapshot.orderCount).toBe(0);
  });
});

describe('computeStoreSalesOverTime', () => {
  it('groups net revenue by order date', () => {
    const orders = [
      createOrder({
        status: 'paid',
        createdAt: '2026-07-09T10:00:00.000Z',
        items: [
          {
            id: 'item-1',
            storeId: 'store-1',
            productName: 'A',
            unitPrice: 100,
            quantity: 1,
            subtotal: 100,
            fulfillmentStatus: 'pending',
          },
        ],
        discountAmount: 0,
        storeShippings: [],
      }),
      createOrder({
        id: 'order-2',
        orderNumber: 'ORD-002',
        status: 'paid',
        createdAt: '2026-07-10T10:00:00.000Z',
        items: [
          {
            id: 'item-2',
            storeId: 'store-1',
            productName: 'B',
            unitPrice: 200,
            quantity: 1,
            subtotal: 200,
            fulfillmentStatus: 'pending',
          },
        ],
        discountAmount: 0,
        storeShippings: [],
      }),
    ];

    expect(computeStoreSalesOverTime(orders, 'store-1', 'all')).toEqual([
      { date: '2026-07-09', revenue: 100, orderCount: 1 },
      { date: '2026-07-10', revenue: 200, orderCount: 1 },
    ]);
  });
});

describe('computeStoreSalesByPayment', () => {
  it('groups revenue by payment method label', () => {
    const orders = [
      createOrder({
        status: 'paid',
        paymentMethod: 'promptpay',
        discountAmount: 0,
        storeShippings: [],
        items: [
          {
            id: 'item-1',
            storeId: 'store-1',
            productName: 'A',
            unitPrice: 100,
            quantity: 1,
            subtotal: 100,
            fulfillmentStatus: 'pending',
          },
        ],
      }),
      createOrder({
        id: 'order-2',
        orderNumber: 'ORD-002',
        status: 'paid',
        paymentMethod: 'credit_card',
        discountAmount: 0,
        storeShippings: [],
        items: [
          {
            id: 'item-2',
            storeId: 'store-1',
            productName: 'B',
            unitPrice: 300,
            quantity: 1,
            subtotal: 300,
            fulfillmentStatus: 'pending',
          },
        ],
      }),
    ];

    expect(computeStoreSalesByPayment(orders, 'store-1', 'all')).toEqual([
      { label: 'บัตรเครดิต', revenue: 300, orderCount: 1 },
      { label: 'พร้อมเพย์', revenue: 100, orderCount: 1 },
    ]);
  });
});
