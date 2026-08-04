import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/types';
import VendorProductsPage from './page';

// jsdom doesn't implement scrollIntoView, which Radix Select calls when opening.
Element.prototype.scrollIntoView = vi.fn();

const mockPush = vi.fn();
const mockPrefetch = vi.fn();

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

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
  prefetchVendorProductDetail: (...args: unknown[]) => mockPrefetch(...args),
}));

describe('VendorProductsPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockPrefetch.mockReset();
    mockUseVendorProducts.mockClear();
  });

  it('navigates to product detail on row click, not edit', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    await user.click(screen.getAllByText('อาหารสุนัข')[0]!);

    expect(mockPush).toHaveBeenCalledWith('/vendor/products/prod-1');
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

    expect(screen.queryByLabelText('หมวดหมู่')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ตัวกรอง' }));

    expect(screen.getByLabelText('หมวดหมู่')).toBeInTheDocument();
    expect(screen.getByLabelText('ประเภทสัตว์เลี้ยง')).toBeInTheDocument();
    expect(screen.getByLabelText('แบรนด์')).toBeInTheDocument();
    expect(screen.getByLabelText('แท็ก')).toBeInTheDocument();
  });

  it('filters vendor products by the selected category slug', async () => {
    const user = userEvent.setup();
    render(<VendorProductsPage />);

    await user.click(screen.getByRole('button', { name: 'ตัวกรอง' }));
    await user.click(screen.getByRole('combobox', { name: 'หมวดหมู่' }));
    await user.click(await screen.findByRole('option', { name: 'อาหาร' }));

    expect(mockUseVendorProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: 'food' }),
    );
    expect(screen.getByRole('button', { name: 'ลบตัวกรอง หมวดหมู่: อาหาร' })).toBeInTheDocument();
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
});
