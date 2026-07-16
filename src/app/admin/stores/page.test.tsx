import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminStore } from '@/types';
import AdminStoresPage from './page';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({
      prefetchQuery: vi.fn(),
    }),
  };
});

vi.mock('@/hooks/useAdminStores', () => ({
  useAdminStores: vi.fn(),
}));

import { useAdminStores } from '@/hooks/useAdminStores';

const mockedUseAdminStores = vi.mocked(useAdminStores);

const MOCK_STORE: AdminStore = {
  id: 'store-1',
  name: 'SOPet Demo Store',
  slug: 'sopet-demo',
  status: 'approved',
  ownerFullName: 'Vendor SOPet',
  ownerEmail: 'vendor@sopet.org',
  createdAt: '2025-12-01T10:00:00.000Z',
};

function mockStores(overrides?: Partial<ReturnType<typeof useAdminStores>>) {
  mockedUseAdminStores.mockReturnValue({
    data: [MOCK_STORE],
    isLoading: false,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useAdminStores>);
}

describe('AdminStoresPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders store list with result count and status badge', () => {
    mockStores();
    render(<AdminStoresPage />);

    expect(screen.getByRole('heading', { name: 'จัดการร้านค้า' })).toBeInTheDocument();
    expect(screen.getAllByText('SOPet Demo Store').length).toBeGreaterThan(0);
    expect(screen.getAllByText('sopet-demo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('เปิดใช้งาน').length).toBeGreaterThan(0);
    expect(screen.getByText('ร้านค้าทั้งหมด 1 รายการ')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'ดูรายละเอียด SOPet Demo Store' }),
    ).toBeInTheDocument();
  });

  it('shows filter empty state with clear action', async () => {
    const user = userEvent.setup();
    mockStores({ data: [] });

    render(<AdminStoresPage />);

    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาร้านค้า' }), 'nobody');

    expect(screen.getByText('ไม่พบร้านค้าที่ตรงกับเงื่อนไข')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างช่องค้นหา' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างตัวกรอง' })).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    mockStores({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    render(<AdminStoresPage />);

    expect(screen.getByLabelText('กำลังโหลดร้านค้า')).toBeInTheDocument();
  });

  it('surfaces load errors with an alert', () => {
    mockStores({
      data: undefined,
      error: new Error('เครือข่ายล้มเหลว'),
    });

    render(<AdminStoresPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('เครือข่ายล้มเหลว');
  });

  it('filters stores by status client-side', async () => {
    const user = userEvent.setup();
    mockStores({
      data: [
        MOCK_STORE,
        {
          ...MOCK_STORE,
          id: 'store-2',
          name: 'Pending Store',
          slug: 'pending-store',
          status: 'pending',
        },
      ],
    });

    render(<AdminStoresPage />);

    expect(screen.getByText('ร้านค้าทั้งหมด 2 รายการ')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'รออนุมัติ' }));

    expect(screen.getByText('แสดง 1 จาก 2 รายการ')).toBeInTheDocument();
    expect(screen.getAllByText('Pending Store').length).toBeGreaterThan(0);
    expect(screen.queryByText('SOPet Demo Store')).not.toBeInTheDocument();
  });
});
