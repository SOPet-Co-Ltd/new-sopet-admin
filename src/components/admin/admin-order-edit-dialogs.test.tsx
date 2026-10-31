import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdminOrderShippingEditDialog,
  AdminOrderStatusEditDialog,
} from './admin-order-edit-dialogs';
import type { Order } from '@/types';

// jsdom doesn't implement scrollIntoView, which Radix Select calls when opening.
Element.prototype.scrollIntoView = vi.fn();

const mutateStatus = vi.fn();
const mutateShipping = vi.fn();

vi.mock('@/hooks/useAdminOrders', () => ({
  useUpdateAdminOrderStatus: () => ({
    mutateAsync: mutateStatus,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
  useUpdateAdminOrderShippingAddress: () => ({
    mutateAsync: mutateShipping,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
}));

const order: Order = {
  id: 'order-1',
  orderNumber: 'ORD-1',
  status: 'paid',
  createdAt: '2026-01-01T00:00:00.000Z',
  subtotal: 100,
  shippingFee: 0,
  discountAmount: 0,
  total: 100,
  paymentMethod: 'promptpay',
  shippingAddress: {
    fullName: 'Somchai',
    phone: '0812345678',
    addressLine1: '123 Main',
    amphoe: 'Bang Kapi',
    province: 'Bangkok',
    postalCode: '10240',
  },
  storeShippings: [],
  items: [],
};

function wrap(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('AdminOrder edit dialogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateStatus.mockResolvedValue({});
    mutateShipping.mockResolvedValue({});
  });

  it('saves a new order status from the status dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    wrap(
      <AdminOrderStatusEditDialog
        open
        onOpenChange={onOpenChange}
        orderId="order-1"
        currentStatus="paid"
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'สถานะ' }));
    await user.click(await screen.findByRole('option', { name: 'จัดส่งแล้ว' }));
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    await waitFor(() => {
      expect(mutateStatus).toHaveBeenCalledWith({ orderId: 'order-1', status: 'shipped' });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('saves shipping address edits', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    wrap(<AdminOrderShippingEditDialog open onOpenChange={onOpenChange} order={order} />);

    const nameInput = screen.getByLabelText(/ชื่อผู้รับ/);
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    await user.click(screen.getByRole('button', { name: 'บันทึก' }));

    await waitFor(() => {
      expect(mutateShipping).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          fullName: 'New Name',
          phone: '0812345678',
        }),
      );
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
