import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product, ProductVariantSyncImpact } from '@/types';
import ProductVariantsPage from './page';

const baseProduct: Product = {
  id: 'prod-1',
  storeId: 'store-1',
  name: 'Pet Shampoo 500ml',
  slug: 'pet-shampoo-500ml',
  description: '',
  basePrice: 0,
  status: 'draft',
  tags: [],
  variants: [
    {
      id: 'var-1',
      sku: 'SHAMPOO-RED',
      price: 199,
      stockQuantity: 10,
      optionsJson: JSON.stringify({ สี: 'แดง' }),
    },
    {
      id: 'var-2',
      sku: 'SHAMPOO-BLUE',
      price: 219,
      stockQuantity: 5,
      optionsJson: JSON.stringify({ สี: 'น้ำเงิน' }),
    },
  ],
};

let mockProduct: Product = baseProduct;
let mockSearchParams = new URLSearchParams();
const mutateAsync = vi.fn().mockResolvedValue([]);
const mockPush = vi.fn();
let mockImpact: ProductVariantSyncImpact = {
  kept: 1,
  new: 0,
  removed: 1,
  blocked: false,
  removedVariants: [
    {
      id: 'var-2',
      sku: 'SHAMPOO-BLUE',
      optionKey: 'สี:น้ำเงิน',
      reasons: [],
      disposition: 'DELETE',
      openCartCount: 0,
    },
  ],
};
let mockImpactLoading = false;
let mockImpactError = false;
const mockRefetch = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'prod-1' }),
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/components/vendor/product-tour/product-tour-provider', () => ({
  useProductTour: () => ({ startTour: vi.fn(), isActive: false }),
}));

vi.mock('@/hooks/useProduct', () => ({
  useProduct: () => ({ data: mockProduct, isLoading: false, error: null }),
}));

vi.mock('@/hooks/useSyncProductVariants', () => ({
  useSyncProductVariants: () => ({
    mutateAsync,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useVariantSyncImpact', () => ({
  useVariantSyncImpact: () => ({
    data: mockImpactError || mockImpactLoading ? undefined : mockImpact,
    isLoading: mockImpactLoading,
    isError: mockImpactError,
    isFetching: mockImpactLoading,
    refetch: mockRefetch,
  }),
}));

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('ProductVariantsPage', () => {
  beforeEach(() => {
    mockProduct = baseProduct;
    mockSearchParams = new URLSearchParams();
    mutateAsync.mockClear();
    mutateAsync.mockResolvedValue([]);
    mockPush.mockClear();
    mockRefetch.mockClear();
    mockImpactLoading = false;
    mockImpactError = false;
    mockImpact = {
      kept: 1,
      new: 0,
      removed: 1,
      blocked: false,
      removedVariants: [
        {
          id: 'var-2',
          sku: 'SHAMPOO-BLUE',
          optionKey: 'สี:น้ำเงิน',
          reasons: [],
          disposition: 'DELETE',
          openCartCount: 0,
        },
      ],
    };
  });

  it('lets the vendor edit option groups directly instead of showing a locked read-only list', () => {
    renderWithQueryClient(<ProductVariantsPage />);

    expect(screen.queryByText(/แก้ไขที่นี่ไม่ได้/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('ชื่อตัวเลือกที่ 1')).toHaveValue('สี');
    expect(screen.getByLabelText('ค่าตัวเลือกที่ 1')).toHaveTextContent('แดง');
    expect(screen.getByLabelText('ค่าตัวเลือกที่ 1')).toHaveTextContent('น้ำเงิน');
  });

  it('shows existing SKUs in the items table with helpful framing copy', () => {
    renderWithQueryClient(<ProductVariantsPage />);

    expect(screen.getByRole('heading', { name: 'Pet Shampoo 500ml' })).toBeInTheDocument();
    expect(
      screen.getByText('จัดการตัวเลือกสินค้า เพิ่ม แก้ไข หรือลบ SKU สต็อก และราคาได้อย่างอิสระ'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'กลับไปหน้าสินค้า' })).toHaveAttribute(
      'href',
      '/vendor/products/prod-1',
    );

    const table = within(screen.getByRole('table'));
    expect(table.getByDisplayValue('SHAMPOO-RED')).toBeInTheDocument();
    expect(table.getByDisplayValue('SHAMPOO-BLUE')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'สรุปตัวเลือก' })).toBeInTheDocument();
  });

  it('shows the shared create-product stepper and finishing copy when arriving from the wizard', () => {
    mockSearchParams = new URLSearchParams('fromWizard=1');

    renderWithQueryClient(<ProductVariantsPage />);

    expect(screen.getByText(/ขั้นที่ 4 จาก 4/)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'ขั้นที่ 4 จาก 4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'เสร็จสิ้นและดูสินค้า' })).toBeInTheDocument();
  });

  it('opens the impact dialog when finishing from the wizard and syncs only after confirm', async () => {
    mockSearchParams = new URLSearchParams('fromWizard=1');
    mockImpact = {
      kept: 2,
      new: 0,
      removed: 0,
      blocked: false,
      removedVariants: [],
    };

    renderWithQueryClient(<ProductVariantsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'เสร็จสิ้นและดูสินค้า' }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'ยืนยันการบันทึกตัวเลือกสินค้า' }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันการบันทึก' }));

    expect(mutateAsync).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/vendor/products/prod-1');
    });
  });

  it('adding a new option value marks rows out of sync and preserves existing SKUs on apply', async () => {
    renderWithQueryClient(<ProductVariantsPage />);

    expect(screen.getByText('รายการ SKU ด้านล่างตรงกับตัวเลือกปัจจุบันแล้ว')).toBeInTheDocument();

    const addValueInput = screen.getByLabelText('เพิ่มค่าตัวเลือกที่ 1');
    await userEvent.type(addValueInput, 'เขียว');
    await userEvent.click(screen.getByRole('button', { name: 'เพิ่ม' }));

    expect(screen.getByText(/ตัวเลือกมีการเปลี่ยนแปลง/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึก SKU/สต็อก/ราคา' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /อัปเดตรายการตัวเลือก/ }));

    expect(screen.getByText('รายการ SKU ด้านล่างตรงกับตัวเลือกปัจจุบันแล้ว')).toBeInTheDocument();
    const table = within(screen.getByRole('table'));
    expect(table.getByDisplayValue('SHAMPOO-RED')).toBeInTheDocument();
    expect(table.getByDisplayValue('SHAMPOO-BLUE')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'รายการ SKU (3)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึก SKU/สต็อก/ราคา' })).toBeEnabled();
    expect(
      screen.queryByRole('heading', { name: 'ยืนยันการบันทึกตัวเลือกสินค้า' }),
    ).not.toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('Save opens impact dialog; Confirm syncs when unblocked', async () => {
    renderWithQueryClient(<ProductVariantsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'ลบค่า น้ำเงิน' }));
    await userEvent.click(screen.getByRole('button', { name: /อัปเดตรายการตัวเลือก/ }));

    expect(screen.getByRole('heading', { name: 'รายการ SKU (1)' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('SHAMPOO-BLUE')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'บันทึก SKU/สต็อก/ราคา' }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'ยืนยันการบันทึกตัวเลือกสินค้า' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/คงไว้ 1 · สร้างใหม่ 0 · ลบ 1/)).toBeInTheDocument();
    expect(screen.getByText('SHAMPOO-BLUE')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันการบันทึก' }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'prod-1',
        variants: [expect.objectContaining({ sku: 'SHAMPOO-RED' })],
      }),
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/vendor/products/prod-1');
    });
  });

  it('allows sync when removals have order history (retire disposition)', async () => {
    mockImpact = {
      kept: 1,
      new: 0,
      removed: 1,
      blocked: false,
      removedVariants: [
        {
          id: 'var-2',
          sku: 'SHAMPOO-BLUE',
          optionKey: 'สี:น้ำเงิน',
          reasons: ['HAS_ORDERS'],
          disposition: 'RETIRE',
          openCartCount: 0,
        },
      ],
    };

    renderWithQueryClient(<ProductVariantsPage />);

    await userEvent.click(screen.getByRole('button', { name: 'บันทึก SKU/สต็อก/ราคา' }));

    expect(
      screen.getByRole('heading', { name: 'ยืนยันการบันทึกตัวเลือกสินค้า' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'SKU ที่จะนำออก' })).toHaveTextContent('SHAMPOO-BLUE');
    expect(screen.getByRole('list', { name: 'SKU ที่จะนำออก' })).toHaveTextContent(
      'เก็บไว้สำหรับคำสั่งซื้อเดิม',
    );

    await userEvent.click(screen.getByRole('button', { name: 'ยืนยันการบันทึก' }));

    expect(mutateAsync).toHaveBeenCalled();
  });

  it('deleting a row directly from the SKU table removes it without touching the option groups', async () => {
    renderWithQueryClient(<ProductVariantsPage />);

    const table = within(screen.getByRole('table'));
    await userEvent.click(table.getByRole('button', { name: /ลบรายการ.*แดง/ }));

    expect(screen.getByRole('heading', { name: 'รายการ SKU (1)' })).toBeInTheDocument();
    expect(screen.queryByDisplayValue('SHAMPOO-RED')).not.toBeInTheDocument();
    expect(screen.getByLabelText('ค่าตัวเลือกที่ 1')).toHaveTextContent('แดง');
    expect(screen.getByLabelText('ค่าตัวเลือกที่ 1')).toHaveTextContent('น้ำเงิน');
  });
});
