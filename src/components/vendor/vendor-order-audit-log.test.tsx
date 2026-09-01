import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorOrderAuditLog } from '@/components/vendor/vendor-order-audit-log';
import type { OrderAuditLogEntry } from '@/types';

const refetch = vi.fn();

vi.mock('@/hooks/useOrderAuditLog', () => ({
  useOrderAuditLog: vi.fn(),
}));

import { useOrderAuditLog } from '@/hooks/useOrderAuditLog';

const mockedUseOrderAuditLog = vi.mocked(useOrderAuditLog);

function entry(overrides: Partial<OrderAuditLogEntry>): OrderAuditLogEntry {
  return {
    id: 'e1',
    orderId: 'order-1',
    eventType: 'ORDER_PLACED',
    occurredAt: '2026-08-14T08:01:12.000Z',
    actorType: 'customer',
    actorId: 'cust-1',
    actorLabel: 'สมชาย ใจดี',
    storeId: null,
    details: { paymentMethod: 'bank_transfer' },
    ...overrides,
  };
}

describe('VendorOrderAuditLog', () => {
  it('renders a chronological timeline of events', () => {
    mockedUseOrderAuditLog.mockReturnValue({
      data: {
        orderId: 'order-1',
        entries: [
          entry({ id: 'e1' }),
          entry({
            id: 'e2',
            eventType: 'PAYMENT_METHOD_CHANGED',
            actorLabel: 'สมชาย ใจดี',
            details: {
              previousPaymentMethod: 'bank_transfer',
              newPaymentMethod: 'promptpay',
            },
          }),
          entry({
            id: 'e3',
            eventType: 'PAYMENT_APPROVED',
            actorType: 'admin',
            actorId: 'should-not-render',
            actorLabel: 'ผู้ดูแลระบบ SOPET',
            details: { approvalMethod: 'manual_bank_transfer' },
          }),
          entry({
            id: 'e4',
            eventType: 'ORDER_ACCEPTED',
            actorType: 'vendor',
            actorLabel: 'ร้านอาหารสัตว์ดี',
            details: { storeId: 'store-1' },
          }),
        ],
      },
      isLoading: false,
      error: null,
      refetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useOrderAuditLog>);

    render(<VendorOrderAuditLog orderId="order-1" storeId="store-1" />);

    expect(screen.getByRole('heading', { name: 'ประวัติคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByText('ลูกค้าสร้างคำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.getByText('ลูกค้าเปลี่ยนวิธีชำระเงิน')).toBeInTheDocument();
    expect(screen.getByText('อนุมัติการชำระเงิน')).toBeInTheDocument();
    expect(screen.getByText('ร้านค้ารับคำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.getByText('ผู้ดูแลระบบ SOPET')).toBeInTheDocument();
    expect(screen.queryByText('should-not-render')).not.toBeInTheDocument();
    expect(screen.getByText(/โอนเงินเข้าบัญชี \(ยืนยันด้วยตนเอง\)/)).toBeInTheDocument();
  });

  it('shows an empty state when there are no entries', () => {
    mockedUseOrderAuditLog.mockReturnValue({
      data: { orderId: 'order-1', entries: [] },
      isLoading: false,
      error: null,
      refetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useOrderAuditLog>);

    render(<VendorOrderAuditLog orderId="order-1" storeId="store-1" />);

    expect(screen.getByText('ยังไม่มีประวัติคำสั่งซื้อ')).toBeInTheDocument();
  });

  it('shows an error with retry', async () => {
    const user = userEvent.setup();
    mockedUseOrderAuditLog.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('network'),
      refetch,
      isFetching: false,
    } as unknown as ReturnType<typeof useOrderAuditLog>);

    render(<VendorOrderAuditLog orderId="order-1" storeId="store-1" />);

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดประวัติคำสั่งซื้อไม่สำเร็จ');
    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(refetch).toHaveBeenCalled();
  });
});
