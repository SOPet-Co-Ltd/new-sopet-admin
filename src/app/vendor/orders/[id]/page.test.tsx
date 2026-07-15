import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '@/types';
import VendorOrderDetailPage from './page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'order-abc-123' }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/hooks/useVendorOrders', () => ({
  useVendorOrders: vi.fn(),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(),
}));

vi.mock('@/components/vendor/vendor-order-detail', () => ({
  VendorOrderDetail: ({ order }: { order: Order }) => (
    <div data-testid="vendor-order-detail" aria-label={order.orderNumber} />
  ),
}));

import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

const mockedUseVendorOrders = vi.mocked(useVendorOrders);
const mockedUseVendorStoreId = vi.mocked(useVendorStoreId);

const MOCK_ORDER: Order = {
  id: 'order-abc-123',
  orderNumber: 'ORD-MRFTYF80-PSFE',
  status: 'pending',
  createdAt: '2026-07-11T10:00:00.000Z',
  subtotal: 1000,
  shippingFee: 50,
  discountAmount: 0,
  total: 1050,
  paymentMethod: 'promptpay',
  storeShippings: [],
  items: [],
};

describe('VendorOrderDetailPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders order detail with back link to orders list', () => {
    mockedUseVendorStoreId.mockReturnValue('store-1');
    mockedUseVendorOrders.mockReturnValue({
      data: [MOCK_ORDER],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useVendorOrders>);

    render(<VendorOrderDetailPage />);

    expect(screen.getByRole('heading', { name: MOCK_ORDER.orderNumber })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /กลับรายการคำสั่งซื้อ/ })).toHaveAttribute(
      'href',
      '/vendor/orders',
    );
    expect(screen.getByTestId('vendor-order-detail')).toHaveAttribute(
      'aria-label',
      MOCK_ORDER.orderNumber,
    );
  });

  it('shows not-found state when order is missing', () => {
    mockedUseVendorStoreId.mockReturnValue('store-1');
    mockedUseVendorOrders.mockReturnValue({
      data: [] as Order[],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useVendorOrders>);

    render(<VendorOrderDetailPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('ไม่พบคำสั่งซื้อ');
    expect(screen.getByRole('link', { name: /กลับรายการคำสั่งซื้อ/ })).toHaveAttribute(
      'href',
      '/vendor/orders',
    );
  });
});
