import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminStore } from '@/types';
import AdminStoresPage from './page';

const nav = vi.hoisted(() => {
  // Inline store so vi.hoisted does not depend on module init order.
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
    usePathname: () => '/admin/stores',
    useSearchParams: () => react.useSyncExternalStore(nav.subscribe, nav.getParams, nav.getParams),
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

function storePage(items: AdminStore[]) {
  return {
    items,
    pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
  };
}

function mockStores(overrides?: Partial<ReturnType<typeof useAdminStores>>) {
  mockedUseAdminStores.mockReturnValue({
    data: storePage([MOCK_STORE]),
    isLoading: false,
    isFetching: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useAdminStores>);
}

describe('AdminStoresPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    nav.resetSearchParams();
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
    mockStores({ data: storePage([]) });

    render(<AdminStoresPage />);

    await user.type(screen.getByRole('searchbox', { name: 'ค้นหาร้านค้า' }), 'nobody');

    expect(await screen.findByText('ไม่พบร้านค้าที่ตรงกับเงื่อนไข')).toBeInTheDocument();
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

    expect(screen.getByRole('alert')).toHaveTextContent('โหลดร้านค้าไม่สำเร็จ');
  });

  it('requests the status filter from the server and writes it to the URL', async () => {
    const user = userEvent.setup();
    const pendingStore: AdminStore = {
      ...MOCK_STORE,
      id: 'store-2',
      name: 'Pending Store',
      slug: 'pending-store',
      status: 'pending',
    };
    mockedUseAdminStores.mockImplementation((params) => {
      const items = params?.status === 'pending' ? [pendingStore] : [MOCK_STORE, pendingStore];
      return {
        data: storePage(items),
        isLoading: false,
        isFetching: false,
        error: null,
      } as ReturnType<typeof useAdminStores>;
    });

    render(<AdminStoresPage />);

    expect(screen.getByText('ร้านค้าทั้งหมด 2 รายการ')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'รออนุมัติ' }));

    expect(nav.replaceMock).toHaveBeenCalledWith('/admin/stores?status=pending', {
      scroll: false,
    });
    expect(mockedUseAdminStores).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending', page: 1, limit: 20 }),
    );
    expect(screen.getByText('พบ 1 รายการ')).toBeInTheDocument();
    expect(screen.getAllByText('Pending Store').length).toBeGreaterThan(0);
    expect(screen.queryByText('SOPet Demo Store')).not.toBeInTheDocument();
  });
});
