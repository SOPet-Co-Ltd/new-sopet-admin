import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '@/types';
import VendorOrdersPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/hooks/useVendorOrders', () => ({
  useVendorOrders: vi.fn(),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(),
}));

vi.mock('@/components/vendor/vendor-order-tracking-link-dialog', () => ({
  VendorOrderTrackingLinkDialog: ({
    open,
    orderNumber,
  }: {
    open: boolean;
    orderNumber: string;
  }) => (
    <div
      data-testid="vendor-order-tracking-link-dialog"
      data-open={open}
      aria-label={orderNumber}
      hidden={!open}
    />
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
   * AC: AC-011 — View details from action menu navigates to order detail page.
   * Behavior: Render vendor orders page → open menu → select view details → router.push to
   * `/vendor/orders/{id}`
   * @category: integration
   * @lane: integration
   * @dependency: VendorOrdersPage, VendorOrdersActionMenu
   */
  it('navigates to order detail page when view details menu item is selected', async () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    await userEvent.click(
      screen.getByRole('button', { name: `การดำเนินการ ${MOCK_ORDER.orderNumber}` }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'ดูรายละเอียด' }));

    expect(pushMock).toHaveBeenCalledWith(`/vendor/orders/${MOCK_ORDER.id}`);
  });

  it('navigates to order detail page when order row is clicked', async () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    await userEvent.click(screen.getByText(MOCK_ORDER.orderNumber));

    expect(pushMock).toHaveBeenCalledWith(`/vendor/orders/${MOCK_ORDER.id}`);
  });

  it('does not navigate when action menu trigger is clicked', async () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    await userEvent.click(
      screen.getByRole('button', { name: `การดำเนินการ ${MOCK_ORDER.orderNumber}` }),
    );

    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: 'ดูรายละเอียด' })).toBeInTheDocument();
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

  /**
   * Regression: tracking dialog must stay mounted when closed so Radix can remove overlay /
   * body pointer-events (conditional unmount left the page unclickable).
   */
  it('keeps tracking link dialog mounted when closed', () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    expect(screen.getByTestId('vendor-order-tracking-link-dialog')).toHaveAttribute(
      'data-open',
      'false',
    );
  });
});
