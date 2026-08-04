import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewProductPage from './page';

// jsdom doesn't implement scrollIntoView, which Radix Select calls when opening.
Element.prototype.scrollIntoView = vi.fn();

const mockPush = vi.fn();
const mockCreateMutateAsync = vi.fn();
const mockSyncMutateAsync = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/hooks/useProductMutations', () => ({
  useCreateProduct: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useSyncProductVariants', () => ({
  useSyncProductVariants: () => ({
    mutateAsync: mockSyncMutateAsync,
    isPending: false,
    error: null,
  }),
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

async function goToStep2() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/ชื่อสินค้า/), 'อาหารสุนัขออร์แกนิก 5 กก.');
  await user.click(screen.getByRole('button', { name: /ถัดไป/ }));
  return user;
}

async function goToStep3() {
  const user = await goToStep2();
  await user.click(screen.getByRole('button', { name: /ถัดไป/ }));
  return user;
}

describe('NewProductPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockCreateMutateAsync.mockReset();
    mockSyncMutateAsync.mockReset();
  });

  it('shows a step-by-step wizard starting on the basics step', () => {
    render(<NewProductPage />);

    expect(screen.getByRole('heading', { name: 'สร้างสินค้า' })).toBeInTheDocument();
    expect(screen.getByText('ขั้นที่ 1 จาก 4 — ข้อมูลพื้นฐาน')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ข้อมูลพื้นฐาน' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'การจัดหมวดหมู่' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /ตัวเลือกสินค้า/ })).not.toBeInTheDocument();

    // Stepper renders all four step labels, including the post-create step.
    expect(screen.getByText('SKU สต็อก และราคา')).toBeInTheDocument();
  });

  it('blocks moving to the next step when the product name is missing', async () => {
    const user = userEvent.setup();
    render(<NewProductPage />);

    await user.click(screen.getByRole('button', { name: /ถัดไป/ }));

    expect(await screen.findByText('กรุณากรอกชื่อสินค้า')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ข้อมูลพื้นฐาน' })).toBeInTheDocument();
  });

  it('advances through categorization to the variant options step', async () => {
    render(<NewProductPage />);

    const user = await goToStep2();
    expect(screen.getByText('ขั้นที่ 2 จาก 4 — การจัดหมวดหมู่')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'การจัดหมวดหมู่' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'ข้อมูลพื้นฐาน' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ถัดไป/ }));
    expect(screen.getByText('ขั้นที่ 3 จาก 4 — ตัวเลือกสินค้า')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ตัวเลือกสินค้า/ })).toBeInTheDocument();
  });

  it('allows navigating back without losing entered data', async () => {
    render(<NewProductPage />);

    const user = await goToStep2();
    await user.click(screen.getByRole('button', { name: 'ก่อนหน้า' }));

    expect(screen.getByRole('heading', { name: 'ข้อมูลพื้นฐาน' })).toBeInTheDocument();
    expect(screen.getByLabelText(/ชื่อสินค้า/)).toHaveValue('อาหารสุนัขออร์แกนิก 5 กก.');
  });

  it('requires at least one variant option before creating the product', async () => {
    render(<NewProductPage />);

    const user = await goToStep3();
    await user.click(screen.getByRole('button', { name: 'สร้างสินค้าและไปกำหนดตัวเลือก' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('ต้องมีอย่างน้อย 1 ตัวเลือก');
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it('creates the product, syncs variants, and continues the wizard on the variants page', async () => {
    mockCreateMutateAsync.mockResolvedValue({ id: 'prod-1', slug: 'dog-food' });
    mockSyncMutateAsync.mockResolvedValue(undefined);

    render(<NewProductPage />);

    const user = await goToStep3();
    await user.type(screen.getByLabelText('ชื่อตัวเลือกที่ 1'), 'สี');
    await user.type(screen.getByLabelText('ค่าตัวเลือกที่ 1'), 'แดง, น้ำเงิน');

    await user.click(screen.getByRole('button', { name: 'สร้างสินค้าและไปกำหนดตัวเลือก' }));

    expect(mockCreateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'อาหารสุนัขออร์แกนิก 5 กก.', basePrice: 0 }),
    );
    expect(mockSyncMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 'prod-1' }),
    );
    expect(mockPush).toHaveBeenCalledWith('/vendor/products/prod-1/variants?fromWizard=1');
  });

  it('keeps cancel reachable from every step', () => {
    render(<NewProductPage />);

    expect(screen.getByRole('link', { name: 'ยกเลิก' })).toHaveAttribute(
      'href',
      '/vendor/products',
    );
  });
});
