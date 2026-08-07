import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VendorOrderDetail } from '@/components/vendor/vendor-order-detail';
import { createOnHoldOrder } from '@/test/fixtures/on-hold-order';

vi.mock('@/hooks/useVendorOrderWorkflow', () => ({
  useAcknowledgeVendorOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useCancelVendorOrder: () => ({ mutate: vi.fn(), isPending: false }),
  useMarkVendorOrderPaid: () => ({ mutate: vi.fn(), isPending: false }),
  useShipVendorOrder: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useShipping', () => ({
  useShippingProviders: () => ({ data: [] }),
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ show: vi.fn() }),
}));

describe('VendorOrderDetail hold UX (AC-016 / AC-034)', () => {
  it('shows hold labels without fulfill CTA or hold toggle controls', () => {
    render(<VendorOrderDetail order={createOnHoldOrder()} storeId="store-1" />);

    expect(screen.getAllByText(/พักการดำเนินการ/).length).toBeGreaterThan(0);
    expect(screen.getByText('พักจัดส่ง')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ยืนยันชำระเงินแล้ว/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /รับคำสั่งซื้อ/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /บันทึกและจัดส่ง/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ยกเลิกคำสั่งซื้อ/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/ตั้งค่าพัก|เคลียร์พัก/)).not.toBeInTheDocument();
    expect(screen.getByText('ไม่มีการดำเนินการที่พร้อมใช้งานในขณะนี้')).toBeInTheDocument();
  });
});
