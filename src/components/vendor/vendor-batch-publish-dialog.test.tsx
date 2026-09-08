import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorBatchPublishDialog } from '@/components/vendor/vendor-batch-publish-dialog';
import { ToastProvider } from '@/components/ui/toast';
import type { Product } from '@/types';

const publishableProducts: Product[] = [
  {
    id: 'prod-1',
    storeId: 'store-1',
    name: 'อาหารสุนัข',
    slug: 'dog-food',
    basePrice: 100,
    status: 'draft',
    category: 'อาหาร',
    petTypeId: 'pet-1',
    brandId: 'brand-1',
    tags: [],
    variants: [{ id: 'var-1', sku: 'SKU-1', price: 100, stockQuantity: 5 }],
    images: [{ id: 'img-1', imageUrl: 'https://example.com/a.jpg', sortOrder: 0 }],
  },
  {
    id: 'prod-2',
    storeId: 'store-1',
    name: 'อาหารแมว',
    slug: 'cat-food',
    basePrice: 120,
    status: 'archived',
    category: 'อาหาร',
    petTypeId: 'pet-2',
    brandId: 'brand-1',
    tags: [],
    variants: [{ id: 'var-2', sku: 'SKU-2', price: 120, stockQuantity: 3 }],
    images: [{ id: 'img-2', imageUrl: 'https://example.com/b.jpg', sortOrder: 0 }],
  },
];

const page2Product: Product = {
  id: 'prod-3',
  storeId: 'store-1',
  name: 'อาหารนก',
  slug: 'bird-food',
  basePrice: 80,
  status: 'draft',
  category: 'อาหาร',
  petTypeId: 'pet-3',
  brandId: 'brand-1',
  tags: [],
  variants: [{ id: 'var-3', sku: 'SKU-3', price: 80, stockQuantity: 2 }],
  images: [{ id: 'img-3', imageUrl: 'https://example.com/c.jpg', sortOrder: 0 }],
};

let mockEmpty = false;
let mockLoading = false;
const mutateAsync = vi.fn();
const onOpenChange = vi.fn();
const onPublished = vi.fn();
const showToast = vi.fn();
const getAllIds = vi.fn();

vi.mock('@/hooks/useVendorPublishableProducts', () => ({
  useVendorPublishableProducts: (params: { page?: number; limit?: number }) => {
    if (mockEmpty) {
      return {
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      };
    }

    const page = params.page ?? 1;
    const items = page === 1 ? publishableProducts : [page2Product];
    const limit = params.limit ?? 10;
    return {
      data: mockLoading
        ? undefined
        : {
            items,
            pagination: {
              page,
              limit,
              total: 3,
              totalPages: 2,
            },
          },
      isLoading: mockLoading,
      isFetching: mockLoading,
      error: null,
      refetch: vi.fn(),
    };
  },
}));

vi.mock('@/lib/api/products', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/products')>('@/lib/api/products');
  return {
    ...actual,
    getAllVendorPublishableProductIds: (...args: unknown[]) => getAllIds(...args),
  };
});

vi.mock('@/hooks/useProductMutations', () => ({
  usePublishProducts: () => ({
    mutateAsync,
    isPending: false,
    reset: vi.fn(),
    error: null,
  }),
}));

vi.mock('@/components/ui/toast', async () => {
  const actual =
    await vi.importActual<typeof import('@/components/ui/toast')>('@/components/ui/toast');
  return {
    ...actual,
    useToast: () => ({
      show: showToast,
      showError: (message: string) => showToast(message, 'error'),
    }),
  };
});

function renderDialog(
  ui: ReactNode = (
    <VendorBatchPublishDialog open onOpenChange={onOpenChange} onPublished={onPublished} />
  ),
) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('VendorBatchPublishDialog', () => {
  beforeEach(() => {
    mockEmpty = false;
    mockLoading = false;
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue({
      publishedCount: 1,
      failedCount: 0,
      publishedIds: ['prod-1'],
      failures: [],
    });
    onOpenChange.mockReset();
    onPublished.mockReset();
    showToast.mockReset();
    getAllIds.mockReset();
    getAllIds.mockResolvedValue(['prod-1', 'prod-2', 'prod-3']);
  });

  it('shows empty state when no publishable products exist', () => {
    mockEmpty = true;
    renderDialog();

    expect(screen.getByText('ยังไม่มีสินค้าที่พร้อมเผยแพร่')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เผยแพร่' })).toBeDisabled();
  });

  it('paginates the publishable product list', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.getByText('หน้า 1 จาก 2')).toBeInTheDocument();
    expect(screen.getByText('แสดง 2 จาก 3 รายการ')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ถัดไป' }));
    expect(screen.getByText(/อาหารนก/)).toBeInTheDocument();
    expect(screen.getByText('หน้า 2 จาก 2')).toBeInTheDocument();
  });

  it('select-all loads every publishable id, not only the current page', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('checkbox', { name: 'เลือกทั้งหมด' }));

    expect(getAllIds).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'เผยแพร่ 3 รายการ' })).toBeEnabled();
    expect(screen.getByText(/เลือกแล้ว 3/)).toBeInTheDocument();
  });

  it('publishes only selected product ids', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('checkbox', { name: /อาหารแมว/i }));
    await user.click(screen.getByRole('button', { name: 'เผยแพร่ 1 รายการ' }));

    expect(mutateAsync).toHaveBeenCalledWith(['prod-2']);
    expect(onPublished).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(showToast).toHaveBeenCalledWith(
      'เผยแพร่แล้ว 1 รายการ — กำลังแสดงรายการที่เผยแพร่',
      'success',
    );
  });

  it('keeps the dialog open and shows failures when nothing was published', async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValue({
      publishedCount: 0,
      failedCount: 1,
      publishedIds: [],
      failures: [
        {
          productId: 'prod-1',
          code: 'PRODUCT_NOT_PUBLISHABLE',
          message: 'ไม่สามารถเผยแพร่ได้ ยังขาด: สต็อก',
        },
      ],
    });
    renderDialog();

    await user.click(screen.getByRole('checkbox', { name: /อาหารสุนัข/i }));
    await user.click(screen.getByRole('button', { name: 'เผยแพร่ 1 รายการ' }));

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(onPublished).not.toHaveBeenCalled();
    expect(screen.getByText('ไม่สามารถเผยแพร่ได้ ยังขาด: สต็อก')).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith('เผยแพร่แล้ว 0 รายการ ไม่สำเร็จ 1 รายการ', 'error');
  });

  it('disables confirm while a publish is not selected', () => {
    renderDialog();
    const footer = screen.getByRole('button', { name: 'เผยแพร่' }).closest('div');
    expect(footer).toBeTruthy();
    expect(within(footer!).getByRole('button', { name: 'เผยแพร่' })).toBeDisabled();
  });
});
