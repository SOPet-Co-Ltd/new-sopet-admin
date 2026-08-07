import { describe, expect, it } from 'vitest';
import { formatCustomerShippingCopyText, formatShippingAddress } from './display';
import type { Order } from '@/types';

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-1',
    status: 'paid',
    createdAt: '2026-01-01T00:00:00.000Z',
    subtotal: 100,
    shippingFee: 40,
    discountAmount: 0,
    total: 140,
    paymentMethod: 'promptpay',
    storeShippings: [],
    items: [],
    shippingAddress: {
      fullName: 'สมชาย ใจดี',
      phone: '0812345678',
      addressLine1: '99 ถนนสุขุมวิท',
      addressLine2: 'อาคาร A',
      tumbon: 'คลองตัน',
      amphoe: 'วัฒนา',
      province: 'กรุงเทพฯ',
      postalCode: '10110',
    },
    ...overrides,
  };
}

describe('formatShippingAddress', () => {
  it('joins address parts with spaces', () => {
    expect(formatShippingAddress(createOrder())).toBe(
      '99 ถนนสุขุมวิท อาคาร A คลองตัน วัฒนา กรุงเทพฯ 10110',
    );
  });
});

describe('formatCustomerShippingCopyText', () => {
  it('formats recipient phone and address as a multi-line block', () => {
    expect(formatCustomerShippingCopyText(createOrder())).toBe(
      ['สมชาย ใจดี', '0812345678', '99 ถนนสุขุมวิท อาคาร A คลองตัน วัฒนา กรุงเทพฯ 10110'].join(
        '\n',
      ),
    );
  });

  it('returns undefined when there is no shipping info', () => {
    expect(
      formatCustomerShippingCopyText(
        createOrder({
          shippingAddress: null,
          guestName: null,
          guestPhone: null,
        }),
      ),
    ).toBeUndefined();
  });
});
