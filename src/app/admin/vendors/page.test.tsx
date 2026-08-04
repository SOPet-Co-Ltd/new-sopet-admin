import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminVendor } from '@/types';
import AdminVendorsPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/hooks/useAdminVendors', () => ({
  useAdminVendors: vi.fn(),
}));

import { useAdminVendors } from '@/hooks/useAdminVendors';

const mockedUseAdminVendors = vi.mocked(useAdminVendors);

const MOCK_VENDOR: AdminVendor = {
  id: 'vendor-1',
  email: 'vendor@example.com',
  fullName: 'Vendor SOPet',
  role: 'vendor',
  isActive: true,
  storeCount: 2,
  createdAt: '2025-12-01T10:00:00.000Z',
};

function mockVendors(overrides?: Partial<ReturnType<typeof useAdminVendors>>) {
  mockedUseAdminVendors.mockReturnValue({
    data: [MOCK_VENDOR],
    isLoading: false,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useAdminVendors>);
}

describe('AdminVendorsPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders vendor list with result count and status badge', () => {
    mockVendors();
    render(<AdminVendorsPage />);

    expect(screen.getByRole('heading', { name: 'ผู้ขาย' })).toBeInTheDocument();
    expect(screen.getAllByText('Vendor SOPet').length).toBeGreaterThan(0);
    expect(screen.getAllByText('vendor@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ใช้งานอยู่').length).toBeGreaterThan(0);
    expect(screen.getByText('ผู้ขายทั้งหมด 1 รายการ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ดูรายละเอียด Vendor SOPet' })).toBeInTheDocument();
  });

  it('shows filter empty state with clear action', async () => {
    const user = userEvent.setup();
    mockVendors({ data: [] });

    render(<AdminVendorsPage />);

    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาผู้ขาย' }), 'nobody');

    expect(screen.getByText('ไม่พบผู้ขายที่ตรงกับเงื่อนไข')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างช่องค้นหา' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างตัวกรอง' })).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    mockVendors({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    render(<AdminVendorsPage />);

    expect(screen.getByLabelText('กำลังโหลดผู้ขาย')).toBeInTheDocument();
  });

  it('surfaces load errors with an alert', () => {
    mockVendors({
      data: undefined,
      error: new Error('เครือข่ายล้มเหลว'),
    });

    render(<AdminVendorsPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('เครือข่ายล้มเหลว');
  });

  it('filters inactive vendors client-side', async () => {
    const user = userEvent.setup();
    mockVendors({
      data: [
        MOCK_VENDOR,
        {
          ...MOCK_VENDOR,
          id: 'vendor-2',
          fullName: 'Suspended Vendor',
          email: 'suspended@example.com',
          isActive: false,
        },
      ],
    });

    render(<AdminVendorsPage />);

    expect(screen.getByText('ผู้ขายทั้งหมด 2 รายการ')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ระงับ' }));

    expect(screen.getByText('แสดง 1 จาก 2 รายการ')).toBeInTheDocument();
    expect(screen.getAllByText('Suspended Vendor').length).toBeGreaterThan(0);
    expect(screen.queryByText('Vendor SOPet')).not.toBeInTheDocument();
  });
});
