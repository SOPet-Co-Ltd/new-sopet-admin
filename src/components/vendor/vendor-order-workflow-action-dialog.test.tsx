import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '@/types';
import { VendorOrderWorkflowActionDialog } from './vendor-order-workflow-action-dialog';

Element.prototype.scrollIntoView = vi.fn();

const markPaidMutate = vi.fn();
const acknowledgeMutate = vi.fn();
const shipMutate = vi.fn();

vi.mock('@/hooks/useVendorOrderWorkflow', () => ({
  useMarkVendorOrderPaid: () => ({ mutate: markPaidMutate, isPending: false }),
  useAcknowledgeVendorOrder: () => ({ mutate: acknowledgeMutate, isPending: false }),
  useShipVendorOrder: () => ({ mutate: shipMutate, isPending: false }),
}));

vi.mock('@/hooks/useShipping', () => ({
  useShippingProviders: () => ({
    data: [{ id: 'kerry', name: 'Kerry Express' }],
  }),
}));

function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    orderNumber: 'ORD-TEST-001',
    status: 'paid',
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
    ...overrides,
  };
}

describe('VendorOrderWorkflowActionDialog', () => {
  beforeEach(() => {
    markPaidMutate.mockReset();
    acknowledgeMutate.mockReset();
    shipMutate.mockReset();
  });

  it('confirms acknowledge action from the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <VendorOrderWorkflowActionDialog
        order={createOrder()}
        storeId="store-1"
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByRole('heading', { name: 'รับออเดอร์' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ยืนยันรับออเดอร์' }));

    expect(acknowledgeMutate).toHaveBeenCalledWith('order-1', expect.any(Object));
  });

  it('confirms mark paid action from the dialog', async () => {
    const user = userEvent.setup();
    render(
      <VendorOrderWorkflowActionDialog
        order={createOrder({
          status: 'pending_payment',
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
        })}
        storeId="store-1"
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'ยืนยันชำระเงิน' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ยืนยันแล้ว' }));
    expect(markPaidMutate).toHaveBeenCalledWith('order-1', expect.any(Object));
  });

  it('submits ship form with provider and tracking number', async () => {
    const user = userEvent.setup();
    render(
      <VendorOrderWorkflowActionDialog
        order={createOrder({
          status: 'processing',
          items: [
            {
              id: 'item-1',
              storeId: 'store-1',
              productName: 'Dog Food',
              unitPrice: 500,
              quantity: 2,
              subtotal: 1000,
              fulfillmentStatus: 'processing',
            },
          ],
        })}
        storeId="store-1"
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'จัดส่งสินค้า' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึกและจัดส่ง' })).toBeDisabled();

    await user.click(screen.getByLabelText('ผู้ให้บริการขนส่ง'));
    await user.click(await screen.findByRole('option', { name: 'Kerry Express' }));
    await user.type(screen.getByPlaceholderText('เช่น TH123456789'), 'TH123');
    await user.click(screen.getByRole('button', { name: 'บันทึกและจัดส่ง' }));

    await waitFor(() => {
      expect(shipMutate).toHaveBeenCalledWith(
        {
          orderId: 'order-1',
          trackingNumber: 'TH123',
          fulfillmentProvider: 'Kerry Express',
          trackingUrl: null,
        },
        expect.any(Object),
      );
    });
  });
});
