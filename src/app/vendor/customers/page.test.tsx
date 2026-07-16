import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VendorCustomer } from '@/types';
import VendorCustomersPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/hooks/useVendorCustomers', () => ({
  useVendorCustomers: vi.fn(),
}));

import { useVendorCustomers } from '@/hooks/useVendorCustomers';

const mockedUseVendorCustomers = vi.mocked(useVendorCustomers);

const MOCK_CUSTOMER: VendorCustomer = {
  id: 'cust-1',
  phone: '0812345678',
  fullName: 'Mai',
  email: 'mai@example.com',
  isVerified: true,
  lastLoginAt: '2026-01-10T08:00:00.000Z',
  createdAt: '2025-12-01T10:00:00.000Z',
};

function mockCustomers(overrides?: Partial<ReturnType<typeof useVendorCustomers>>) {
  mockedUseVendorCustomers.mockReturnValue({
    data: {
      items: [MOCK_CUSTOMER],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useVendorCustomers>);
}

describe('VendorCustomersPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders customer list with result count and verification badge', () => {
    mockCustomers();
    render(<VendorCustomersPage />);

    expect(screen.getByRole('heading', { name: 'ลูกค้า' })).toBeInTheDocument();
    expect(screen.getAllByText('Mai').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0812345678').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ยืนยันแล้ว').length).toBeGreaterThan(0);
    expect(screen.getByText('ลูกค้าทั้งหมด 1 รายการ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ดูรายละเอียด Mai' })).toBeInTheDocument();
  });

  it('shows search empty state with clear action', async () => {
    const user = userEvent.setup();
    mockCustomers({
      data: {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    });

    render(<VendorCustomersPage />);

    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาลูกค้า' }), 'nobody');

    expect(screen.getByText('ไม่พบลูกค้าที่ตรงกับคำค้นหา')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างช่องค้นหา' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างคำค้นหา' })).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    mockCustomers({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    render(<VendorCustomersPage />);

    expect(screen.getByLabelText('กำลังโหลดลูกค้า')).toBeInTheDocument();
  });

  it('surfaces load errors with an alert', () => {
    mockCustomers({
      data: undefined,
      error: new Error('เครือข่ายล้มเหลว'),
    });

    render(<VendorCustomersPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('เครือข่ายล้มเหลว');
  });
});
