import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminCustomer } from '@/types';
import AdminCustomersPage from './page';

const nav = vi.hoisted(() => {
  let currentParams = new URLSearchParams();
  const listeners = new Set<() => void>();
  const pushMock = vi.fn();
  const replaceMock = vi.fn();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function applyHref(href: string) {
    const queryIndex = href.indexOf('?');
    currentParams =
      queryIndex >= 0 ? new URLSearchParams(href.slice(queryIndex + 1)) : new URLSearchParams();
    notify();
  }

  return {
    pushMock,
    replaceMock,
    resetSearchParams: () => {
      currentParams = new URLSearchParams();
      notify();
    },
    setSearchParams: (value: string) => {
      currentParams = new URLSearchParams(value);
      notify();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getParams: () => currentParams,
    applyHref,
  };
});

vi.mock('next/navigation', async () => {
  const react = await import('react');
  return {
    useRouter: () => ({
      push: nav.pushMock,
      replace: (href: string, options?: { scroll?: boolean }) => {
        nav.replaceMock(href, options);
        nav.applyHref(href);
      },
      prefetch: vi.fn(),
    }),
    usePathname: () => '/admin/customers',
    useSearchParams: () =>
      react.useSyncExternalStore(nav.subscribe, nav.getParams, nav.getParams),
  };
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({
      prefetchQuery: vi.fn(),
    }),
  };
});

vi.mock('@/hooks/useAdminCustomers', () => ({
  useAdminCustomers: vi.fn(),
}));

import { useAdminCustomers } from '@/hooks/useAdminCustomers';

const mockedUseAdminCustomers = vi.mocked(useAdminCustomers);

const MOCK_CUSTOMER: AdminCustomer = {
  id: 'cust-1',
  phone: '0812345678',
  fullName: 'Mai',
  email: 'mai@example.com',
  isVerified: true,
  isActive: true,
  lastLoginAt: '2026-01-10T08:00:00.000Z',
  createdAt: '2025-12-01T10:00:00.000Z',
};

function mockCustomers(overrides?: Partial<ReturnType<typeof useAdminCustomers>>) {
  mockedUseAdminCustomers.mockReturnValue({
    data: {
      items: [MOCK_CUSTOMER],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useAdminCustomers>);
}

describe('AdminCustomersPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    nav.resetSearchParams();
  });

  it('writes page=2 to the URL when Next is clicked', async () => {
    const user = userEvent.setup();
    mockCustomers({
      data: {
        items: [MOCK_CUSTOMER],
        pagination: { page: 1, limit: 20, total: 40, totalPages: 2 },
      },
    });

    render(<AdminCustomersPage />);
    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));

    expect(nav.replaceMock).toHaveBeenCalledWith('/admin/customers?page=2', { scroll: false });
  });

  it('renders customer list with result count and status badges', () => {
    mockCustomers();
    render(<AdminCustomersPage />);

    expect(screen.getByRole('heading', { name: 'ลูกค้า' })).toBeInTheDocument();
    expect(screen.getAllByText('Mai').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0812345678').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ใช้งานอยู่').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ยืนยันแล้ว').length).toBeGreaterThan(0);
    expect(screen.getByText('ลูกค้าทั้งหมด 1 รายการ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'แก้ไข Mai' })).toBeInTheDocument();
  });

  it('shows search empty state with clear action', async () => {
    const user = userEvent.setup();
    mockCustomers({
      data: {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    });

    render(<AdminCustomersPage />);

    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาลูกค้า' }), 'nobody');

    expect(await screen.findByText('ไม่พบลูกค้าที่ตรงกับคำค้นหา')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างช่องค้นหา' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ล้างคำค้นหา' })).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    mockCustomers({
      data: undefined,
      isLoading: true,
      isFetching: true,
    });

    render(<AdminCustomersPage />);

    expect(screen.getByLabelText('กำลังโหลดลูกค้า')).toBeInTheDocument();
  });

  it('surfaces load errors with an alert', () => {
    mockCustomers({
      data: undefined,
      error: new Error('เครือข่ายล้มเหลว'),
    });

    render(<AdminCustomersPage />);

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดรายการลูกค้าไม่สำเร็จ');
  });
});
