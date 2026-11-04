import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminStoreCustomerSummaryCard } from './admin-store-customer-summary-card';

const useStoreCustomerSummaryMock = vi.fn();

vi.mock('@/hooks/useCustomerSummaries', () => ({
  useStoreCustomerSummary: (...args: unknown[]) => useStoreCustomerSummaryMock(...args),
  useCustomerPurchaseSummary: vi.fn(),
}));

describe('AdminStoreCustomerSummaryCard', () => {
  beforeEach(() => {
    useStoreCustomerSummaryMock.mockReturnValue({
      data: {
        year: 2026,
        month: 3,
        lifetimeMonths: 20,
        repeatRate: 0.4,
        purchasesPerMonth: 0.18,
        averageOrderValue: 700,
        newCustomerCount: 70,
        oldCustomerCount: 30,
        oldCustomerPercent: 0.3,
        orderCount: 36,
        buyersInMonth: 100,
        totalCustomers: 200,
      },
      isLoading: false,
      error: null,
    });
  });

  it('renders the five summary labels', () => {
    render(
      <AdminStoreCustomerSummaryCard storeId="store-1" storeCreatedAt="2026-01-15T00:00:00.000Z" />,
    );

    expect(screen.getByText('Customer Lifetime (เดือน)')).toBeInTheDocument();
    expect(screen.getByText('Purchases per Month')).toBeInTheDocument();
    expect(screen.getByText('AOV (ยอดต่อออเดอร์)')).toBeInTheDocument();
    expect(screen.getByText('New Customer (ลูกค้าใหม่)')).toBeInTheDocument();
    expect(screen.getByText('Old Customer (ลูกค้าเก่า)')).toBeInTheDocument();
    expect(screen.getByText('20 เดือน')).toBeInTheDocument();
    expect(screen.getByText('70 คน')).toBeInTheDocument();
  });
});
