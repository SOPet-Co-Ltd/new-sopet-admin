import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/types';
import EditProductPage from './page';

const baseProduct: Product = {
  id: 'prod-1',
  storeId: 'store-1',
  name: 'อาหารสุนัขออร์แกนิก',
  slug: 'organic-dog-food',
  description: 'อาหารคุณภาพสูงสำหรับสุนัข',
  basePrice: 590,
  warning: '',
  expiryDate: '2027-01-15',
  status: 'draft',
  categoryId: 'cat-1',
  petTypeId: 'pet-1',
  brandId: 'brand-1',
  tags: [],
  tagIds: ['tag-1'],
  images: [
    {
      id: 'img-1',
      imageUrl: 'https://cdn.example.com/dog-food.jpg',
      sortOrder: 0,
      isThumbnail: true,
    },
  ],
  variants: [{ id: 'v1', sku: 'SKU1', price: 100, stockQuantity: 5 }],
};

let mockProduct: Product = baseProduct;
const updateMutateAsync = vi.fn().mockResolvedValue({});

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'prod-1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/useProduct', () => ({
  useProduct: () => ({ data: mockProduct, isLoading: false, error: null }),
}));

vi.mock('@/hooks/useProductMutations', () => ({
  useUpdateProduct: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
    error: null,
  }),
  usePublishProduct: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useDeleteProduct: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

vi.mock('@/hooks/useTaxonomy', () => ({
  useApprovedCategories: () => ({
    data: [{ id: 'cat-1', name: 'อาหารสุนัข', slug: 'dog-food', status: 'approved' }],
    isLoading: false,
  }),
  useApprovedPetTypes: () => ({
    data: [{ id: 'pet-1', name: 'สุนัข', slug: 'dog', status: 'approved' }],
    isLoading: false,
  }),
  useApprovedBrands: () => ({
    data: [{ id: 'brand-1', name: 'SoPet Foods', slug: 'sopet-foods', status: 'approved' }],
    isLoading: false,
  }),
  useApprovedTags: () => ({
    data: [{ id: 'tag-1', name: 'ออร์แกนิก', slug: 'organic', status: 'approved' }],
    isLoading: false,
  }),
  useCreateCategory: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useCreatePetType: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useCreateBrand: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useCreateTag: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
}));

vi.mock('@/components/vendor/product-images-manager', () => ({
  ProductImagesManager: () => <div>images-manager</div>,
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('EditProductPage', () => {
  beforeEach(() => {
    mockProduct = baseProduct;
    updateMutateAsync.mockClear();
    updateMutateAsync.mockResolvedValue({});
  });

  it('renders focused sections instead of one long field list', () => {
    renderWithQueryClient(<EditProductPage />);

    expect(screen.getByRole('heading', { name: 'อาหารสุนัขออร์แกนิก' })).toBeInTheDocument();
    expect(screen.getByText('แก้ไขข้อมูลสินค้าและรูปภาพ')).toBeInTheDocument();
    expect(screen.queryByText(/จัดการตัวเลือกได้ที่หน้ารายการตัวเลือก/)).not.toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'ข้อมูลพื้นฐาน' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'รูปภาพสินค้า' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'การจัดหมวดหมู่' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'ราคา' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'รายละเอียดเพิ่มเติม' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'การเผยแพร่' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'โซนอันตราย' })).toBeInTheDocument();
  });

  it('shows a single, obvious publish control with the checklist alongside it', () => {
    renderWithQueryClient(<EditProductPage />);

    expect(screen.getByLabelText('สถานะสินค้า')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เผยแพร่สินค้า' })).toBeEnabled();
    expect(screen.getAllByText('ประเภทสัตว์เลี้ยง').length).toBeGreaterThan(0);
  });

  it('does not show the price card or variants price link when the product has variants', () => {
    renderWithQueryClient(<EditProductPage />);

    expect(screen.queryByRole('heading', { name: 'ราคา' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'จัดการตัวเลือก' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('ราคาฐาน')).not.toBeInTheDocument();
  });

  it('removes the sticky global cancel/save footer and uses section save buttons', () => {
    renderWithQueryClient(<EditProductPage />);

    expect(screen.queryByRole('link', { name: 'ยกเลิก' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'บันทึก' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'บันทึกส่วนนี้' })).toHaveLength(2);
  });

  it('saves only basic info fields from that section button', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<EditProductPage />);

    const nameInput = screen.getByRole('textbox', { name: /ชื่อสินค้า/ });
    await waitFor(() => {
      expect(nameInput).toHaveValue('อาหารสุนัขออร์แกนิก');
    });
    await user.clear(nameInput);
    await user.type(nameInput, 'ชื่อสินค้าใหม่');

    const [basicSave] = screen.getAllByRole('button', { name: 'บันทึกส่วนนี้' });
    await user.click(basicSave);

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 'prod-1',
        input: {
          name: 'ชื่อสินค้าใหม่',
          description: 'อาหารคุณภาพสูงสำหรับสุนัข',
        },
      });
    });
  });

  it('updates the publish checklist when the name field is cleared', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<EditProductPage />);

    expect(screen.getByRole('button', { name: 'เผยแพร่สินค้า' })).toBeEnabled();

    const nameInput = screen.getByRole('textbox', { name: /ชื่อสินค้า/ });
    await waitFor(() => {
      expect(nameInput).toHaveValue('อาหารสุนัขออร์แกนิก');
    });
    await user.clear(nameInput);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'เผยแพร่สินค้า' })).toBeDisabled();
    });
  });
});
