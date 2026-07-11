import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryDeleteDialog } from './category-delete-dialog';
import type { TaxonomyItem } from '@/types';

vi.mock('@/hooks/useTaxonomy', () => ({
  useCategoryDeleteImpact: vi.fn(),
  useDeleteCategory: vi.fn(),
}));

import { useCategoryDeleteImpact, useDeleteCategory } from '@/hooks/useTaxonomy';

const mockedUseCategoryDeleteImpact = vi.mocked(useCategoryDeleteImpact);
const mockedUseDeleteCategory = vi.mocked(useDeleteCategory);

const deleteTargetCategory: TaxonomyItem = {
  id: 'cat-delete-1',
  name: 'หมวดทดสอบ',
  slug: 'test-category',
  status: 'approved',
};

const replacementCategory: TaxonomyItem = {
  id: 'cat-replacement-1',
  name: 'ของเล่น',
  slug: 'toys',
  status: 'approved',
};

function createImpactWithOverflow() {
  const products = Array.from({ length: 10 }, (_, index) => ({
    id: `prod-${index + 1}`,
    name: `สินค้า ${String.fromCharCode(65 + index)}`,
    slug: `product-${index + 1}`,
  }));

  return {
    productCount: 12,
    products,
  };
}

function createMutationMock<TInput, TResult>(
  mutateAsyncImpl?: (input: TInput) => Promise<TResult>,
) {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(mutateAsyncImpl ?? (async () => undefined as TResult)),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  };
}

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('search taxonomy delete wizard integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows impact step with product overflow (AC-031)', async () => {
    const impact = createImpactWithOverflow();

    mockedUseCategoryDeleteImpact.mockReturnValue({
      data: impact,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    mockedUseDeleteCategory.mockReturnValue(createMutationMock() as never);

    renderWithQueryClient(
      <CategoryDeleteDialog
        open
        onOpenChange={vi.fn()}
        category={deleteTargetCategory}
        approvedCategories={[deleteTargetCategory, replacementCategory]}
      />,
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('หมวดหมู่นี้มีสินค้า 12 รายการ')).toBeInTheDocument();

    for (const product of impact.products) {
      expect(within(dialog).getByText(product.name)).toBeInTheDocument();
    }

    expect(within(dialog).getByText('และอีก 2 รายการ')).toBeInTheDocument();
  });

  it('disables Next on replacement step until selection (AC-033)', async () => {
    const user = userEvent.setup();

    mockedUseCategoryDeleteImpact.mockReturnValue({
      data: { productCount: 3, products: [{ id: 'p1', name: 'สินค้า A', slug: 'a' }] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    mockedUseDeleteCategory.mockReturnValue(createMutationMock() as never);

    renderWithQueryClient(
      <CategoryDeleteDialog
        open
        onOpenChange={vi.fn()}
        category={deleteTargetCategory}
        approvedCategories={[replacementCategory]}
      />,
    );

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'ถัดไป' }));

    const replacementNext = within(dialog).getByRole('button', { name: 'ถัดไป' });
    expect(replacementNext).toBeDisabled();

    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'หมวดหมู่ทดแทน' }),
      replacementCategory.id,
    );

    expect(replacementNext).toBeEnabled();
  });

  it('calls deleteCategory with replacementCategoryId on confirm (AC-032)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const deleteMutateAsync = vi.fn(async () => ({
      success: true,
      deletedId: deleteTargetCategory.id,
      detachedProductCount: 3,
      notifiedStoreCount: 0,
    }));

    mockedUseCategoryDeleteImpact.mockReturnValue({
      data: { productCount: 3, products: [{ id: 'p1', name: 'สินค้า A', slug: 'a' }] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    mockedUseDeleteCategory.mockReturnValue(createMutationMock(deleteMutateAsync) as never);

    renderWithQueryClient(
      <CategoryDeleteDialog
        open
        onOpenChange={onOpenChange}
        category={deleteTargetCategory}
        approvedCategories={[replacementCategory]}
      />,
    );

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'ถัดไป' }));
    await user.selectOptions(
      within(dialog).getByRole('combobox', { name: 'หมวดหมู่ทดแทน' }),
      replacementCategory.id,
    );
    await user.click(within(dialog).getByRole('button', { name: 'ถัดไป' }));
    await user.click(within(dialog).getByRole('button', { name: 'ลบหมวดหมู่' }));

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith({
        id: deleteTargetCategory.id,
        replacementCategoryId: replacementCategory.id,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('skips replacement step when productCount is zero (AC-017)', async () => {
    const user = userEvent.setup();
    const deleteMutateAsync = vi.fn(async () => ({
      success: true,
      deletedId: deleteTargetCategory.id,
      detachedProductCount: 0,
      notifiedStoreCount: 0,
    }));

    mockedUseCategoryDeleteImpact.mockReturnValue({
      data: { productCount: 0, products: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    mockedUseDeleteCategory.mockReturnValue(createMutationMock(deleteMutateAsync) as never);

    renderWithQueryClient(
      <CategoryDeleteDialog
        open
        onOpenChange={vi.fn()}
        category={deleteTargetCategory}
        approvedCategories={[replacementCategory]}
      />,
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('ไม่มีสินค้าในหมวดหมู่นี้')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'ถัดไป' }));
    expect(within(dialog).getByRole('button', { name: 'ลบหมวดหมู่' })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'ลบหมวดหมู่' }));

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith({ id: deleteTargetCategory.id });
    });
  });
});
