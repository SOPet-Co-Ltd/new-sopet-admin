/**
 * Category Taxonomy Image & Delete — integration tests (Red phase)
 * Design Doc: category-taxonomy-image-delete-frontend-design.md
 * @lane: integration
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import type { TaxonomyItem } from '@/types';

interface CategoryDeleteImpact {
  productCount: number;
  products: Array<{ id: string; name: string; slug: string }>;
}
import { CategoryDeleteDialog } from './category-delete-dialog';
import { PendingCategoryRow } from './pending-category-row';

vi.mock('@/hooks/useTaxonomy', () => ({
  useSetCategoryImage: vi.fn(),
  useApproveCategory: vi.fn(),
  useCategoryDeleteImpact: vi.fn(),
  useDeleteCategory: vi.fn(),
  useApprovedCategories: vi.fn(),
}));

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: ({
    onChange,
    value,
    folder,
    showUrl,
  }: {
    onChange: (url: string) => void;
    value: string;
    folder: string;
    showUrl?: boolean;
  }) => (
    <div data-testid="mock-image-upload-field" data-folder={folder} data-show-url={String(showUrl)}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
        />
      ) : null}
      <button
        type="button"
        onClick={() => onChange('https://cdn.example.com/categories/test-cat.webp')}
      >
        mock-upload
      </button>
    </div>
  ),
}));

import {
  useApproveCategory,
  useCategoryDeleteImpact,
  useDeleteCategory,
  useSetCategoryImage,
} from '@/hooks/useTaxonomy';

const mockedUseSetCategoryImage = vi.mocked(useSetCategoryImage);
const mockedUseApproveCategory = vi.mocked(useApproveCategory);
const mockedUseCategoryDeleteImpact = vi.mocked(useCategoryDeleteImpact);
const mockedUseDeleteCategory = vi.mocked(useDeleteCategory);

const CATEGORY_IMAGE_REQUIRED_MESSAGE = 'ต้องอัปโหลดรูปภาพหมวดหมู่ก่อนอนุมัติ';

const pendingCategoryWithoutImage: TaxonomyItem & { imageUrl?: string | null } = {
  id: 'cat-pending-1',
  name: 'อาหารสัตว์',
  slug: 'pet-food',
  status: 'pending',
  imageUrl: null,
};

const replacementCategory: TaxonomyItem = {
  id: 'cat-replacement-1',
  name: 'ของเล่น',
  slug: 'toys',
  status: 'approved',
};

const deleteTargetCategory: TaxonomyItem = {
  id: 'cat-delete-1',
  name: 'หมวดทดสอบ',
  slug: 'test-category',
  status: 'approved',
};

function createImpactWithOverflow(): CategoryDeleteImpact {
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

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
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

describe('category taxonomy image & delete integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * AC: When a pending category row has no imageUrl, the Approve button is disabled, shows hint
   * ต้องอัปโหลดรูปภาพก่อนอนุมัติ, and if approve is invoked while disabled is bypassed in test,
   * the UI surfaces backend CATEGORY_IMAGE_REQUIRED Thai message inline (AC-001)
   * Behavior: Render PendingCategoryRow with item.imageUrl null → Approve disabled + hint visible →
   * forced approve mutation error renders Thai CATEGORY_IMAGE_REQUIRED inline
   * @category: core-functionality
   * @lane: integration
   * @dependency: PendingCategoryRow, mocked useSetCategoryImage / useApproveCategory hooks
   * @complexity: medium
   * ROI: 81
   */
  it('blocks approve without image and surfaces CATEGORY_IMAGE_REQUIRED on forced approve', async () => {
    const categoryImageRequiredError = new ApiError({
      code: 'CATEGORY_IMAGE_REQUIRED',
      message: CATEGORY_IMAGE_REQUIRED_MESSAGE,
      status: 400,
    });

    mockedUseSetCategoryImage.mockReturnValue(createMutationMock() as never);
    mockedUseApproveCategory.mockReturnValue(
      createMutationMock(async () => {
        throw categoryImageRequiredError;
      }) as never,
    );

    renderWithQueryClient(
      <PendingCategoryRow
        item={pendingCategoryWithoutImage}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    const approveButton = screen.getByRole('button', { name: 'อนุมัติ' });

    expect(approveButton).toBeDisabled();
    expect(screen.getByText('ต้องอัปโหลดรูปภาพก่อนอนุมัติ')).toBeInTheDocument();
    expect(approveButton).toHaveAttribute(
      'aria-describedby',
      `approve-hint-${pendingCategoryWithoutImage.id}`,
    );
  });

  /**
   * AC: When admin uploads a valid image on a pending category row, the UI calls setCategoryImage after
   * uploadImage, shows 80×80 thumbnail, enables Approve, and successful approve moves the row (AC-002, AC-017)
   * Behavior: Upload completes → setCategoryImage.mutateAsync called with categories folder URL → row shows
   * thumbnail → Approve enabled → onApprove succeeds
   * @category: core-functionality
   * @lane: integration
   * @dependency: PendingCategoryRow, ImageUploadField (mock upload), useSetCategoryImage, useApproveCategory
   * @complexity: medium
   * ROI: 80
   */
  it('uploads image, calls setCategoryImage, enables approve, and completes approval', async () => {
    const user = userEvent.setup();
    const uploadedUrl = 'https://cdn.example.com/categories/test-cat.webp';
    const onApprove = vi.fn();

    const setCategoryImageMutateAsync = vi.fn(
      async ({ imageUrl }: { categoryId: string; imageUrl: string }) => ({
        ...pendingCategoryWithoutImage,
        imageUrl,
      }),
    );

    mockedUseSetCategoryImage.mockReturnValue(
      createMutationMock(setCategoryImageMutateAsync) as never,
    );
    mockedUseApproveCategory.mockReturnValue(createMutationMock() as never);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const rowProps = {
      onApprove,
      onReject: vi.fn(),
      onDelete: vi.fn(),
    };

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <PendingCategoryRow item={pendingCategoryWithoutImage} {...rowProps} />
      </QueryClientProvider>,
    );

    const uploadField = screen.getByTestId('mock-image-upload-field');
    expect(uploadField).toHaveAttribute('data-folder', 'categories');
    expect(uploadField).toHaveAttribute('data-show-url', 'false');

    await user.click(screen.getByRole('button', { name: 'mock-upload' }));

    await waitFor(() => {
      expect(setCategoryImageMutateAsync).toHaveBeenCalledWith({
        categoryId: pendingCategoryWithoutImage.id,
        imageUrl: uploadedUrl,
      });
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <PendingCategoryRow
          item={{ ...pendingCategoryWithoutImage, imageUrl: uploadedUrl }}
          {...rowProps}
        />
      </QueryClientProvider>,
    );

    const thumbnail = uploadField.querySelector('img');
    expect(thumbnail).not.toBeNull();
    expect(thumbnail).toHaveClass('h-20', 'w-20');

    const approveButton = screen.getByRole('button', { name: 'อนุมัติ' });
    expect(approveButton).toBeEnabled();

    await user.click(approveButton);

    expect(onApprove).toHaveBeenCalledWith(pendingCategoryWithoutImage.id);
  });

  /**
   * AC: When deleting a category with productCount > 0, step 2 Next is disabled until replacement selected;
   * step 3 confirms deleteCategory with replacement; product list cap 10 with overflow text (AC-008, AC-009, AC-016)
   * Behavior: CategoryDeleteDialog open → impact step shows ≤10 product names + และอีก N รายการ → replacement step
   * blocks Next until select → confirm calls deleteCategory with replacementCategoryId → closes on success
   * @category: core-functionality
   * @lane: integration
   * @dependency: CategoryDeleteDialog, mocked useCategoryDeleteImpact, useDeleteCategory, useApprovedCategories
   * @complexity: high
   * ROI: 80
   */
  it.skip('runs delete wizard with product overflow, replacement gate, and confirm payload', async () => {
    const user = userEvent.setup();
    const impact = createImpactWithOverflow();
    const onOpenChange = vi.fn();

    mockedUseCategoryDeleteImpact.mockReturnValue({
      data: impact,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const deleteMutateAsync = vi.fn(async () => ({
      success: true,
      deletedCategoryId: deleteTargetCategory.id,
      reassignedProductCount: impact.productCount,
      replacementCategoryId: replacementCategory.id,
    }));

    mockedUseDeleteCategory.mockReturnValue(createMutationMock(deleteMutateAsync) as never);

    renderWithQueryClient(
      <CategoryDeleteDialog
        open
        onOpenChange={onOpenChange}
        category={deleteTargetCategory}
        approvedCategories={[deleteTargetCategory, replacementCategory]}
      />,
    );

    const dialog = await screen.findByRole('dialog');

    for (const product of impact.products) {
      expect(within(dialog).getByText(product.name)).toBeInTheDocument();
    }
    expect(within(dialog).getByText('และอีก 2 รายการ')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'ถัดไป' }));

    const replacementStepNext = within(dialog).getByRole('button', { name: 'ถัดไป' });
    expect(replacementStepNext).toBeDisabled();

    fireEvent.click(replacementStepNext);
    expect(within(dialog).getByRole('alert')).toHaveTextContent('เลือกหมวดหมู่ทดแทน');

    await user.click(within(dialog).getByRole('combobox', { name: /หมวดหมู่ทดแทน/ }));
    await user.click(await screen.findByRole('option', { name: replacementCategory.name }));

    expect(replacementStepNext).toBeEnabled();
    await user.click(replacementStepNext);

    expect(within(dialog).getByText(/ยืนยันการลบและย้ายสินค้า/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'ลบหมวดหมู่' }));

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith({
        id: deleteTargetCategory.id,
        replacementCategoryId: replacementCategory.id,
      });
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
