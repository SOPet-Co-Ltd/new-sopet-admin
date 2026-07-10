import { describe, expect, it } from 'vitest';
import { computeTopProductsFromOrders } from '@/lib/orders/top-products';
import type { Order } from '@/types';

function createOrder(status: string, items: Order['items'], overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-001',
    status,
    createdAt: '2026-01-01T00:00:00.000Z',
    subtotal: 0,
    shippingFee: 0,
    discountAmount: 0,
    total: 0,
    paymentMethod: 'promptpay',
    items,
    storeShippings: [],
    ...overrides,
  };
}

describe('computeTopProductsFromOrders', () => {
  it('aggregates quantities and revenue for the active store only', () => {
    const orders = [
      createOrder('paid', [
        {
          id: 'item-1',
          storeId: 'store-1',
          productName: 'Pet Shampoo 500ml',
          unitPrice: 250,
          quantity: 2,
          subtotal: 500,
          fulfillmentStatus: 'pending',
        },
        {
          id: 'item-2',
          storeId: 'store-2',
          productName: 'Other Store Product',
          unitPrice: 100,
          quantity: 9,
          subtotal: 900,
          fulfillmentStatus: 'pending',
        },
      ]),
      createOrder('delivered', [
        {
          id: 'item-3',
          storeId: 'store-1',
          productName: 'Pet Shampoo 500ml',
          unitPrice: 250,
          quantity: 3,
          subtotal: 750,
          fulfillmentStatus: 'delivered',
        },
      ]),
    ];

    expect(computeTopProductsFromOrders(orders, 'store-1')).toEqual([
      {
        productId: 'pet shampoo 500ml',
        productName: 'Pet Shampoo 500ml',
        totalSold: 5,
        revenue: 1250,
      },
    ]);
  });

  it('excludes cancelled and refunded orders', () => {
    const orders = [
      createOrder('cancelled', [
        {
          id: 'item-1',
          storeId: 'store-1',
          productName: 'Pet Shampoo 500ml',
          unitPrice: 250,
          quantity: 10,
          subtotal: 2500,
          fulfillmentStatus: 'cancelled',
        },
      ]),
      createOrder('refunded', [
        {
          id: 'item-2',
          storeId: 'store-1',
          productName: 'Pet Shampoo 500ml',
          unitPrice: 250,
          quantity: 4,
          subtotal: 1000,
          fulfillmentStatus: 'cancelled',
        },
      ]),
      createOrder('paid', [
        {
          id: 'item-3',
          storeId: 'store-1',
          productName: 'Pet Shampoo 500ml',
          unitPrice: 250,
          quantity: 1,
          subtotal: 250,
          fulfillmentStatus: 'pending',
        },
      ]),
    ];

    const [topProduct] = computeTopProductsFromOrders(orders, 'store-1');

    expect(topProduct).toEqual({
      productId: 'pet shampoo 500ml',
      productName: 'Pet Shampoo 500ml',
      totalSold: 1,
      revenue: 250,
    });
  });
});
