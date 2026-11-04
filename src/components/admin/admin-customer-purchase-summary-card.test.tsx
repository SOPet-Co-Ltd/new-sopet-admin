import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCustomerPurchaseSummaryCard } from './admin-customer-purchase-summary-card';

const useCustomerPurchaseSummaryMock = vi.fn();

vi.mock('@/hooks/useCustomerSummaries', () => ({
  useStoreCustomerSummary: vi.fn(),
  useCustomerPurchaseSummary: (...args: unknown[]) => useCustomerPurchaseSummaryMock(...args),
}));

describe('AdminCustomerPurchaseSummaryCard', () => {
  beforeEach(() => {
    useCustomerPurchaseSummaryMock.mockReturnValue({
      data: {
        year: 2026,
        month: 3,
        purchasesInMonth: 2,
        averageOrderValue: 1250,
        cohortLabel: 'old',
        cohortLabelTh: 'ลูกค้าเก่า',
        lastOrderAt: '2026-01-08T12:00:00.000Z',
        monthsSinceLastOrder: 2,
        daysSinceLastOrder: 16,
      },
      isLoading: false,
      error: null,
    });
  });

  it('renders last-order recency, purchases, AOV, and cohort label', () => {
    render(<AdminCustomerPurchaseSummaryCard customerId="cust-1" />);

    expect(screen.getByText('สั่งซื้อครั้งล่าสุด')).toBeInTheDocument();
    expect(screen.getByText('2 เดือน 16 วันมาแล้ว')).toBeInTheDocument();
    expect(screen.getByText('Purchases per Month')).toBeInTheDocument();
    expect(screen.getByText('AOV (ยอดต่อออเดอร์)')).toBeInTheDocument();
    expect(screen.getByText('สถานะลูกค้า')).toBeInTheDocument();
    expect(screen.getByText('ลูกค้าเก่า')).toBeInTheDocument();
  });
});
