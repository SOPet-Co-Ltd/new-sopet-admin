import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VendorOrderFilters } from './vendor-order-filters';

// jsdom doesn't implement scrollIntoView, which Radix Select calls when opening.
Element.prototype.scrollIntoView = vi.fn();

const baseProps = {
  queue: 'action' as const,
  actionableCount: 3,
  status: 'all' as const,
  paymentMethod: 'all' as const,
  onQueueChange: vi.fn(),
  onStatusChange: vi.fn(),
  onPaymentMethodChange: vi.fn(),
  onClearAll: vi.fn(),
};

describe('VendorOrderFilters', () => {
  it('keeps payment filter collapsed until the toggle is opened', async () => {
    const user = userEvent.setup();
    render(<VendorOrderFilters {...baseProps} leading={<input aria-label="ค้นหาคำสั่งซื้อ" />} />);

    expect(screen.getByLabelText('ค้นหาคำสั่งซื้อ')).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'มุมมองคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'สถานะคำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.queryByLabelText('วิธีชำระเงิน')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }));

    expect(screen.getByLabelText('วิธีชำระเงิน')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'ตัวเลือกตัวกรอง' })).toBeInTheDocument();
  });

  it('exposes always-visible status and queue controls', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onQueueChange = vi.fn();
    render(
      <VendorOrderFilters
        {...baseProps}
        onStatusChange={onStatusChange}
        onQueueChange={onQueueChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'ชำระแล้ว' }));
    expect(onStatusChange).toHaveBeenCalledWith('paid');

    await user.click(screen.getByRole('tab', { name: 'ทั้งหมด' }));
    expect(onQueueChange).toHaveBeenCalledWith('all');
  });

  it('shows removable chips and clears active filters', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const onPaymentMethodChange = vi.fn();
    const onClearAll = vi.fn();

    render(
      <VendorOrderFilters
        {...baseProps}
        status="paid"
        paymentMethod="promptpay"
        onStatusChange={onStatusChange}
        onPaymentMethodChange={onPaymentMethodChange}
        onClearAll={onClearAll}
      />,
    );

    expect(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม 1 รายการ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลบตัวกรอง สถานะ: ชำระแล้ว' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ลบตัวกรอง ชำระเงิน: พร้อมเพย์' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลบตัวกรอง สถานะ: ชำระแล้ว' }));
    expect(onStatusChange).toHaveBeenCalledWith('all');

    await user.click(screen.getByRole('button', { name: 'ล้างทั้งหมด' }));
    expect(onClearAll).toHaveBeenCalled();
  });
});
