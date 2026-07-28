import { describe, expect, it } from 'vitest';
import type { Order, OrderItem } from '@/types';
import { canVendorCancelOrder, getVendorOrderWorkflowAction } from '@/lib/orders/workflow';

function item(
  overrides: Partial<OrderItem> & Pick<OrderItem, 'id' | 'storeId' | 'fulfillmentStatus'>,
): OrderItem {
  return {
    productName: 'Product',
    quantity: 1,
    unitPrice: 100,
    subtotal: 100,
    ...overrides,
  } as OrderItem;
}

function order(overrides: Partial<Order> & Pick<Order, 'status' | 'items'>): Order {
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

describe('getVendorOrderWorkflowAction hold exclusion (AC-034)', () => {
  it('returns none when all store items are on_hold', () => {
    const held = order({
      status: 'processing',
      items: [item({ id: 'i1', storeId: 'store-1', fulfillmentStatus: 'on_hold' })],
    });

    expect(getVendorOrderWorkflowAction(held, 'store-1')).toBe('none');
  });

  it('returns none when order status is on_hold', () => {
    const held = order({
      status: 'on_hold',
      items: [item({ id: 'i1', storeId: 'store-1', fulfillmentStatus: 'on_hold' })],
    });

    expect(getVendorOrderWorkflowAction(held, 'store-1')).toBe('none');
  });

  it('returns none when actionable set is only held (mixed held + shipped)', () => {
    const mixed = order({
      status: 'processing',
      items: [
        item({ id: 'i1', storeId: 'store-1', fulfillmentStatus: 'on_hold' }),
        item({ id: 'i2', storeId: 'store-1', fulfillmentStatus: 'shipped' }),
      ],
    });

    expect(getVendorOrderWorkflowAction(mixed, 'store-1')).toBe('none');
  });

  it('returns none for unpaid order whose store items are all on_hold', () => {
    const unpaidHeld = order({
      status: 'pending_payment',
      items: [item({ id: 'i1', storeId: 'store-1', fulfillmentStatus: 'on_hold' })],
    });

    expect(getVendorOrderWorkflowAction(unpaidHeld, 'store-1')).toBe('none');
  });

  it('still acknowledges non-held paid pending items', () => {
    const paid = order({
      status: 'paid',
      items: [item({ id: 'i1', storeId: 'store-1', fulfillmentStatus: 'pending' })],
    });

    expect(getVendorOrderWorkflowAction(paid, 'store-1')).toBe('acknowledge');
  });
});

describe('canVendorCancelOrder hold denial', () => {
  it('denies cancel when store items are on_hold', () => {
    const held = order({
      status: 'paid',
      items: [item({ id: 'i1', storeId: 'store-1', fulfillmentStatus: 'on_hold' })],
    });

    expect(canVendorCancelOrder(held, 'store-1')).toBe(false);
  });
});
