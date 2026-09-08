import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/types';
import VendorProductsPage from './page';

// jsdom doesn't implement scrollIntoView, which Radix Select calls when opening.
Element.prototype.scrollIntoView = vi.fn();

const nav = vi.hoisted(() => {
  let currentParams = new URLSearchParams();
  const listeners = new Set<() => void>();
  const pushMock = vi.fn();
  const replaceMock = vi.fn();
  const prefetchMock = vi.fn();

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
    prefetchMock,
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

const products: Product[] = [
  {
    id: 'prod-1',
    storeId: 'store-1',
    name: 'อาหารสุนัข',
    slug: 'dog-food',
    basePrice: 100,
    status: 'published',
    category: 'อาหาร',
    petTypeId: 'pet-1',
    brandId: 'brand-1',
    tags: ['ออร์แกนิก', 'พรีเมียม'],
    variants: [],
  },
];

vi.mock('next/navigation', async () => {
  const react = await import('react');
  return {
    useRouter: () => ({
      push: nav.pushMock,
      replace: (href: string, options?: { scroll?: boolean }) => {
        nav.replaceMock(href, options);
        nav.applyHref(href);
      },
      prefetch: nav.prefetchMock,
    }),
    usePathname: () => '/vendor/products',
    useSearchParams: () => react.useSyncExternalStore(nav.subscribe, nav.getParams, nav.getParams),
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

const mockUseVendorProducts = vi.fn((params: unknown) => {
  void params;
  return {
    data: { items: products, pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    isLoading: false,
    error: null,
  };
});

vi.mock('@/hooks/useVendorProducts', () => ({
  useVendorProducts: (params: unknown) => mockUseVendorProducts(params),
}));

vi.mock('@/hooks/useProductMutations', () => ({
  useDeleteProduct: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    error: null,
  }),
  usePublishProducts: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    reset: vi.fn(),
    error: null,
  }),
}));

vi.mock('@/hooks/useVendorPublishableProducts', () => ({
  useVendorPublishableProducts: () => ({
    data: { items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } },
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/components/ui/toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToast: () => ({ show: vi.fn(), showError: vi.fn() }),
}));

vi.mock('@/hooks/useTaxonomy', () => ({
  useApprovedCategories: () => ({
    data: [{ id: 'cat-1', name: 'อาหาร', slug: 'food', status: 'approved' }],
  }),
  useApprovedPetTypes: () => ({
    data: [{ id: 'pet-1', name: 'สุนัข', slug: 'dog', status: 'approved' }],
  }),
  useApprovedBrands: () => ({
    data: [{ id: 'brand-1', name: 'SoPet Foods', slug: 'sopet-foods', status: 'approved' }],
  }),
  useApprovedTags: () => ({
    data: [
      { id: 'tag-1', name: 'ออร์แกนิก', slug: 'organic', status: 'approved' },
      { id: 'tag-2', name: 'พรีเมียม', slug: 'premium', status: 'approved' },
    ],
  }),
}));

vi.mock('@/lib/react-query/prefetch-dashboard-nav', () => ({
  createDetailPrefetchHandlers: () => ({}),
  prefetchVendorProductDetail: (...args: unknown[]) => nav.prefetchMock(...args),
}));

describe('VendorProductsPage', () => {
  beforeEach(() => {
    nav.pushMock.mockReset();
    nav.replaceMock.mockReset();
    nav.prefetchMock.mockReset();
    nav.resetSearchParams();
    mockUseVendorProducts.mockClear();
  });

  it('navigates to product detail on row click, not edit', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    await user.click(screen.getAllByText('อาหารสุนัข')[0]!);

    expect(nav.pushMock).toHaveBeenCalledWith('/vendor/products/prod-1');
  });

  it('renders a batch publish button next to add product', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    expect(screen.getByRole('link', { name: /เพิ่มสินค้า/ })).toBeInTheDocument();
    const batchButton = screen.getByRole('button', { name: 'เผยแพร่หลายรายการ' });
    expect(batchButton).toBeInTheDocument();

    await user.click(batchButton);
    expect(screen.getByRole('dialog', { name: 'เผยแพร่หลายรายการ' })).toBeInTheDocument();
  });

  it('shows pet type, brand, and tags columns', () => {
    render(<VendorProductsPage />);

    expect(screen.getByRole('columnheader', { name: 'ประเภทสัตว์' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'แบรนด์' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'แท็ก' })).toBeInTheDocument();
    expect(screen.getAllByText('สุนัข').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SoPet Foods').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('ออร์แกนิก').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('พรีเมียม').length).toBeGreaterThanOrEqual(1);
  });

  it('renders taxonomy filters behind the filter toggle', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    expect(screen.getByRole('group', { name: 'สถานะสินค้า' })).toBeInTheDocument();
    expect(screen.queryByLabelText('หมวดหมู่')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }));

    expect(screen.getByLabelText('หมวดหมู่')).toBeInTheDocument();
    expect(screen.getByLabelText('ประเภทสัตว์เลี้ยง')).toBeInTheDocument();
    expect(screen.getByLabelText('แบรนด์')).toBeInTheDocument();
    expect(screen.getByLabelText('แท็ก')).toBeInTheDocument();
    expect(screen.getByLabelText('ต่ำสุด')).toBeInTheDocument();
    expect(screen.getByLabelText('สูงสุด')).toBeInTheDocument();
  });

  it('filters vendor products by the selected category slug', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    await user.click(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }));
    await user.click(screen.getByRole('combobox', { name: 'หมวดหมู่' }));
    await user.click(await screen.findByRole('option', { name: 'อาหาร' }));

    expect(mockUseVendorProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: 'food' }),
    );
    expect(screen.getByRole('button', { name: 'ลบตัวกรอง หมวดหมู่: อาหาร' })).toBeInTheDocument();
  });

  it('filters vendor products by status and price range', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    await user.click(screen.getByRole('button', { name: 'เผยแพร่' }));
    expect(mockUseVendorProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'published' }),
    );

    await user.click(screen.getByRole('button', { name: 'ตัวกรองเพิ่มเติม' }));
    await user.type(screen.getByLabelText('ต่ำสุด'), '50');
    await user.type(screen.getByLabelText('สูงสุด'), '200');
    await user.tab();

    expect(mockUseVendorProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'published',
        minPrice: 50,
        maxPrice: 200,
      }),
    );
  });

  it('keeps edit available from the row action menu', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    await user.click(screen.getAllByRole('button', { name: 'การดำเนินการ อาหารสุนัข' })[0]!);
    expect(screen.getByRole('menuitem', { name: 'แก้ไข' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1/edit',
    );
    expect(screen.getByRole('menuitem', { name: 'แก้ไขสต็อก' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1/stock',
    );
  });

  it('renders a mobile list with status badge', () => {
    render(<VendorProductsPage />);

    expect(screen.getByRole('button', { name: 'ดูรายละเอียด อาหารสุนัข' })).toBeInTheDocument();
    expect(screen.getAllByText('เผยแพร่').length).toBeGreaterThanOrEqual(1);
  });

  it('mirrors desktop columns (pet type, brand, category, tags) in the mobile card', () => {
    render(<VendorProductsPage />);

    const mobileCard = screen.getByRole('button', { name: 'ดูรายละเอียด อาหารสุนัข' });

    expect(within(mobileCard).getByText('สุนัข')).toBeInTheDocument();
    expect(within(mobileCard).getByText('SoPet Foods')).toBeInTheDocument();
    expect(within(mobileCard).getByText('อาหาร')).toBeInTheDocument();
    expect(within(mobileCard).getByText('ออร์แกนิก')).toBeInTheDocument();
    expect(within(mobileCard).getByText('พรีเมียม')).toBeInTheDocument();
  });

  it('writes page=2 to the URL when Next is clicked', async () => {
    const user = userEvent.setup();
    mockUseVendorProducts.mockImplementation(() => ({
      data: {
        items: products,
        pagination: { page: 1, limit: 10, total: 20, totalPages: 2 },
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    }));

    render(<VendorProductsPage />);
    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));

    expect(nav.replaceMock).toHaveBeenCalledWith('/vendor/products?page=2', { scroll: false });
  });

  it('writes status filter to the URL and drops page', async () => {
    const user = userEvent.setup();
    nav.setSearchParams('page=3');
    render(<VendorProductsPage />);

    await user.click(screen.getByRole('button', { name: 'ฉบับร่าง' }));

    const href = nav.replaceMock.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('status=draft');
    expect(href).not.toContain('page=');
  });
});
