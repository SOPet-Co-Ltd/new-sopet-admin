import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '@/types';
import VendorOrdersPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams('queue=action'),
}));

vi.mock('@/hooks/useVendorOrders', () => ({
  useVendorOrders: vi.fn(),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(),
}));

vi.mock('@/hooks/useVendorOrderWorkflow', () => ({
  useMarkVendorOrderPaid: () => ({ mutate: vi.fn(), isPending: false }),
  useAcknowledgeVendorOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useShipVendorOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useCancelVendorOrder: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useShipping', () => ({
  useShippingProviders: () => ({ data: [] }),
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
  status: 'pending_payment',
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
  it('shows inline workflow action for actionable orders', () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    expect(screen.getByRole('button', { name: 'ยืนยันชำระเงิน' })).toBeInTheDocument();
  });

  it('opens workflow action dialog when next-step button is clicked', async () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันชำระเงิน' }));

    expect(screen.getByRole('heading', { name: 'ยืนยันชำระเงิน' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันแล้ว' })).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

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

  /**
   * Regression (QA-hunt): while auth/vendor Zustand stores are still hydrating, storeId is
   * undefined and useVendorOrders is disabled - its own `isLoading` stays false, so without
   * accounting for a missing storeId the page briefly rendered the "ยังไม่มีคำสั่งซื้อ" /
   * "ไม่มีออเดอร์ที่ต้องดำเนินการ" empty state instead of a loading skeleton.
   */
  it('shows loading skeleton (not an empty state) while storeId has not resolved yet', () => {
    mockedUseVendorStoreId.mockReturnValue(undefined);
    mockedUseVendorOrders.mockReturnValue({
      data: [] as Order[],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useVendorOrders>);

    render(<VendorOrdersPage />);

    expect(screen.getByLabelText('กำลังโหลดคำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.queryByText('ยังไม่มีคำสั่งซื้อ')).not.toBeInTheDocument();
    expect(screen.queryByText('ไม่มีออเดอร์ที่ต้องดำเนินการ')).not.toBeInTheDocument();
  });

  it('renders search, queue, and always-visible status filters', () => {
    mockVendorOrdersPage();
    render(<VendorOrdersPage />);

    expect(screen.getByLabelText('ค้นหาคำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'มุมมองคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'สถานะคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' })).toBeInTheDocument();
  });
});
