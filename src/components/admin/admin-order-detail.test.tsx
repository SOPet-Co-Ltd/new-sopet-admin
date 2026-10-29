import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminOrderDetail } from './admin-order-detail';
import type { AdminOrder } from '@/lib/api/admin-orders';

const multiStoreOrder: AdminOrder = {
  order: {
    id: 'order-1',
    orderNumber: 'ORD-100',
    status: 'paid',
    createdAt: '2026-01-01T10:00:00.000Z',
    subtotal: 500,
    shippingFee: 80,
    discountAmount: 0,
    total: 580,
    paymentMethod: 'promptpay',
    guestName: null,
    guestPhone: null,
    guestEmail: null,
    shippingAddress: {
      fullName: 'Somchai',
      phone: '0811111111',
      addressLine1: '123 Main',
      amphoe: 'Bang Kapi',
      province: 'Bangkok',
      postalCode: '10240',
    },
    storeShippings: [
      { storeId: 'store-1', optionName: 'Standard', shippingFee: 40 },
      { storeId: 'store-2', optionName: 'Express', shippingFee: 40 },
    ],
    items: [
      {
        id: 'item-1',
        storeId: 'store-1',
        productName: 'Dog Food',
        unitPrice: 250,
        quantity: 1,
        subtotal: 250,
        fulfillmentStatus: 'pending',
        trackingNumber: null,
      },
      {
        id: 'item-2',
        storeId: 'store-2',
        productName: 'Cat Litter',
        unitPrice: 250,
        quantity: 1,
        subtotal: 250,
        fulfillmentStatus: 'shipped',
        trackingNumber: 'TH123',
      },
    ],
  },
  stores: [
    { id: 'store-1', name: 'Pet Shop A' },
    { id: 'store-2', name: 'Pet Shop B' },
  ],
  customer: {
    id: 'cust-1',
    fullName: 'Somchai',
    phone: '0811111111',
    email: 'a@example.com',
  },
};

const guestOrder: AdminOrder = {
  ...multiStoreOrder,
  customer: null,
  order: {
    ...multiStoreOrder.order,
    guestName: 'Guest User',
    guestPhone: '0822222222',
    guestEmail: 'guest@example.com',
    shippingAddress: multiStoreOrder.order.shippingAddress,
  },
};

describe('AdminOrderDetail', () => {
  it('groups line items under each store and links customer', () => {
    render(<AdminOrderDetail record={multiStoreOrder} />);

    const storeALinks = screen.getAllByRole('link', { name: 'Pet Shop A' });
    const storeBLinks = screen.getAllByRole('link', { name: 'Pet Shop B' });
    expect(storeALinks.length).toBeGreaterThan(0);
    expect(storeBLinks.length).toBeGreaterThan(0);
    expect(storeALinks[0]).toHaveAttribute('href', '/admin/stores/store-1');
    expect(storeBLinks[0]).toHaveAttribute('href', '/admin/stores/store-2');
    expect(screen.getByText('Dog Food')).toBeInTheDocument();
    expect(screen.getByText('Cat Litter')).toBeInTheDocument();
    expect(screen.getByText('TH123')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Somchai' })).toHaveAttribute(
      'href',
      '/admin/customers/cust-1',
    );
    expect(screen.queryByText('ขั้นตอนถัดไป')).not.toBeInTheDocument();
    expect(screen.queryByText('บันทึกออเดอร์')).not.toBeInTheDocument();
  });

  it('shows guest contact without a customer link', () => {
    render(<AdminOrderDetail record={guestOrder} />);

    expect(screen.getByText('Guest User')).toBeInTheDocument();
    expect(screen.getByText('0822222222')).toBeInTheDocument();
    expect(screen.getByText('guest@example.com')).toBeInTheDocument();
    expect(screen.getByText('ลูกค้าทั่วไป')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Guest User' })).not.toBeInTheDocument();
  });
});
