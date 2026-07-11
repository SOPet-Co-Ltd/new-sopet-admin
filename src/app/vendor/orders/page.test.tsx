import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '@/types';
import VendorOrdersPage from './page';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/useVendorOrders', () => ({
  useVendorOrders: vi.fn(),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(),
}));

vi.mock('@/components/vendor/vendor-order-detail-dialog', () => ({
  VendorOrderDetailDialog: ({ open, order }: { open: boolean; order: Order | null }) =>
    open && order ? (
      <div data-testid="vendor-order-detail-dialog" aria-label={order.orderNumber} />
    ) : null,
}));

vi.mock('@/components/vendor/vendor-order-tracking-link-dialog', () => ({
  VendorOrderTrackingLinkDialog: ({ open, orderNumber }: { open: boolean; orderNumber: string }) =>
    open ? <div data-testid="vendor-order-tracking-link-dialog" aria-label={orderNumber} /> : null,
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
  items: [
    {
      id: 'item-1',
      storeId: 'store-1',
      productName: 'Dog Food',
      unitPrice: 500,
      quantity: 2,
      subtotal: 1000,
      fulfillmentStatus: 'pending',
    },
  ],
};

function mockVendorOrdersPage() {
  mockedUseVendorStoreId.mockReturnValue('store-1');
  mockedUseVendorOrders.mockReturnValue({
    data: [MOCK_ORDER],
    isLoading: false,
    error: null,
  } as ReturnType<typeof useVendorOrders>);
}

describe('VendorOrdersPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * AC: AC-011 — Detail dialog opens from action menu with unchanged behavior (regression smoke).
   * Behavior: Render vendor orders page → open menu → select view details → detail dialog visible
   * with correct order number
   * @category: integration
   * @lane: integration
   * @dependency: VendorOrdersPage, VendorOrdersActionMenu, VendorOrderDetailDialog mock
   */
  it('opens detail dialog when view details menu item is selected', async () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    await userEvent.click(
      screen.getByRole('button', { name: `การดำเนินการ ${MOCK_ORDER.orderNumber}` }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'ดูรายละเอียด' }));

    expect(screen.getByTestId('vendor-order-detail-dialog')).toHaveAttribute(
      'aria-label',
      MOCK_ORDER.orderNumber,
    );
  });

  /**
   * AC: AC-012 — Tracking-link dialog opens when "คัดลอกลิงก์ติดตาม" is selected from the page menu.
   * Behavior: Render vendor orders page → open menu → select copy tracking link → tracking dialog
   * visible with correct order number
   * @category: integration
   * @lane: integration
   * @dependency: VendorOrdersPage, VendorOrdersActionMenu, VendorOrderTrackingLinkDialog mock
   */
  it('opens tracking link dialog when copy tracking link menu item is selected', async () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    await userEvent.click(
      screen.getByRole('button', { name: `การดำเนินการ ${MOCK_ORDER.orderNumber}` }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'คัดลอกลิงก์ติดตาม' }));

    expect(screen.getByTestId('vendor-order-tracking-link-dialog')).toHaveAttribute(
      'aria-label',
      MOCK_ORDER.orderNumber,
    );
  });
});
