import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminCustomerOrderHistory } from './admin-customer-order-history';
import type { AdminCustomerRecentOrder } from '@/types';

const orders: AdminCustomerRecentOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-100',
    status: 'delivered',
    total: 999,
    createdAt: '2026-01-01T10:00:00.000Z',
    items: [
      { productName: 'ทรายแมว', quantity: 2, unitPrice: 199, subtotal: 398 },
      { productName: 'ของเล่นแมว', quantity: 1, unitPrice: 601, subtotal: 601 },
    ],
  },
];

describe('AdminCustomerOrderHistory', () => {
  it('renders order rows with product summary', () => {
    render(<AdminCustomerOrderHistory orders={orders} />);

    expect(screen.getByText('ORD-100')).toBeInTheDocument();
    expect(screen.getByText('ทรายแมว และอีก 1 รายการ')).toBeInTheDocument();
    expect(screen.getByText('ส่งถึงแล้ว')).toBeInTheDocument();
  });

  it('shows empty state when there are no orders', () => {
    render(<AdminCustomerOrderHistory orders={[]} />);

    expect(screen.getByText('ยังไม่มีประวัติการสั่งซื้อ')).toBeInTheDocument();
  });
});
