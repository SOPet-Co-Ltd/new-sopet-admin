import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('pages 10 orders at a time and filters by order number', async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 11 }, (_, index) => ({
      ...orders[0],
      id: `order-${index + 1}`,
      orderNumber: index === 10 ? 'ORD-LAST' : `ORD-${index + 1}`,
    }));

    render(<AdminCustomerOrderHistory orders={many} />);

    expect(screen.getByText('ORD-1')).toBeInTheDocument();
    expect(screen.queryByText('ORD-LAST')).not.toBeInTheDocument();
    expect(screen.getByText(/ทั้งหมด 11 รายการ/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
    expect(screen.getByText('ORD-LAST')).toBeInTheDocument();
    expect(screen.queryByText('ORD-1')).not.toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'กรองเลขคำสั่งซื้อ' }), 'last');
    expect(screen.getByText('ORD-LAST')).toBeInTheDocument();
    expect(screen.getByText(/ทั้งหมด 1 รายการ/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'ถัดไป' })).not.toBeInTheDocument();
  });

  it('shows empty state when there are no orders', () => {
    render(<AdminCustomerOrderHistory orders={[]} />);

    expect(screen.getByText('ยังไม่มีประวัติการสั่งซื้อ')).toBeInTheDocument();
  });
});
