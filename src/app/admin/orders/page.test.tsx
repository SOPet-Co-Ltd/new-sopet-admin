import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminOrder } from '@/lib/api/admin-orders';
import AdminOrdersPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  usePathname: () => '/admin/orders',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/useAdminOrders', () => ({
  useAdminOrders: vi.fn(),
}));

import { useAdminOrders } from '@/hooks/useAdminOrders';

const mockedUseAdminOrders = vi.mocked(useAdminOrders);

const MOCK_ORDER: AdminOrder = {
  order: {
    id: 'order-1',
    orderNumber: 'ORD-ADMIN-001',
    status: 'paid',
    createdAt: '2026-01-01T10:00:00.000Z',
    subtotal: 500,
    shippingFee: 50,
    discountAmount: 0,
    total: 550,
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
    storeShippings: [],
    items: [
      {
        id: 'item-1',
        storeId: 'store-1',
        productName: 'Dog Food',
        unitPrice: 500,
        quantity: 1,
        subtotal: 500,
        fulfillmentStatus: 'pending',
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

describe('AdminOrdersPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders store and customer links without workflow controls', () => {
    mockedUseAdminOrders.mockReturnValue({
      data: {
        items: [MOCK_ORDER],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminOrders>);

    render(<AdminOrdersPage />);

    expect(screen.getByText('ORD-ADMIN-001')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Somchai' })).toHaveAttribute(
      'href',
      '/admin/customers/cust-1',
    );
    expect(screen.getByRole('link', { name: 'Pet Shop A' })).toHaveAttribute(
      'href',
      '/admin/stores/store-1',
    );
    expect(screen.getByRole('link', { name: 'Pet Shop B' })).toHaveAttribute(
      'href',
      '/admin/stores/store-2',
    );
    expect(screen.queryByText('ขั้นตอนถัดไป')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ยืนยัน|จัดส่ง|ยกเลิก/ })).not.toBeInTheDocument();
  });

  it('navigates to order detail on row click', async () => {
    const user = userEvent.setup();
    mockedUseAdminOrders.mockReturnValue({
      data: {
        items: [MOCK_ORDER],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
      isLoading: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useAdminOrders>);

    render(<AdminOrdersPage />);

    await user.click(screen.getByText('ORD-ADMIN-001'));
    expect(pushMock).toHaveBeenCalledWith('/admin/orders/order-1');
  });
});
