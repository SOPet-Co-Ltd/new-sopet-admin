import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryCreateCard } from './category-create-card';
import { PendingCategoryRow } from './pending-category-row';
import { PendingPetTypeRow } from './pending-pet-type-row';

const taxonomyHookMocks = vi.hoisted(() => ({
  useSetCategoryImage: vi.fn(),
  useApproveCategory: vi.fn(),
  useCreateCategory: vi.fn(),
  useSetPetTypeImage: vi.fn(),
  useTagDeleteImpact: vi.fn(),
  useCategoryDeleteImpact: vi.fn(),
  usePetTypeDeleteImpact: vi.fn(),
  useBrandDeleteImpact: vi.fn(),
  useDeleteCategory: vi.fn(),
  useDeleteTag: vi.fn(),
  useDeletePetType: vi.fn(),
  useDeleteBrand: vi.fn(),
  useApprovedCategories: vi.fn(),
}));

vi.mock('@/hooks/useTaxonomy', () => taxonomyHookMocks);

vi.mock('@/components/ui/image-upload-field', () => ({
  ImageUploadField: ({
    onChange,
    value,
    folder,
  }: {
    onChange: (url: string) => void;
    value: string;
    folder: string;
  }) => (
    <div data-testid="mock-image-upload-field" data-folder={folder}>
      {value ? <img src={value} alt="" /> : null}
      <button type="button" onClick={() => onChange(`https://cdn.example.com/${folder}/test.webp`)}>
        mock-upload
      </button>
    </div>
  ),
}));

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
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('requests and pet type image gate integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    taxonomyHookMocks.useTagDeleteImpact.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
    taxonomyHookMocks.useCategoryDeleteImpact.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
    taxonomyHookMocks.usePetTypeDeleteImpact.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
    taxonomyHookMocks.useBrandDeleteImpact.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
    taxonomyHookMocks.useDeleteCategory.mockReturnValue(createMutationMock() as never);
    taxonomyHookMocks.useDeleteTag.mockReturnValue(createMutationMock() as never);
    taxonomyHookMocks.useDeletePetType.mockReturnValue(createMutationMock() as never);
    taxonomyHookMocks.useDeleteBrand.mockReturnValue(createMutationMock() as never);
    taxonomyHookMocks.useApprovedCategories.mockReturnValue({ data: [] } as never);
    taxonomyHookMocks.useSetCategoryImage.mockReturnValue(createMutationMock() as never);
    taxonomyHookMocks.useApproveCategory.mockReturnValue(createMutationMock() as never);
    taxonomyHookMocks.useSetPetTypeImage.mockReturnValue(createMutationMock() as never);
    taxonomyHookMocks.useCreateCategory.mockReturnValue(createMutationMock() as never);
  });

  it('blocks category approve without image with hint (AC-034, AC-035)', () => {
    renderWithQueryClient(
      <PendingCategoryRow
        item={{
          id: 'cat-pending-1',
          name: 'อาหารสัตว์',
          slug: 'pet-food',
          status: 'pending',
          imageUrl: null,
        }}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    const approveButton = screen.getByRole('button', { name: 'อนุมัติ' });
    expect(approveButton).toBeDisabled();
    expect(screen.getByText('ต้องอัปโหลดรูปภาพก่อนอนุมัติ')).toBeInTheDocument();
    expect(approveButton).toHaveAttribute('aria-describedby', 'approve-hint-cat-pending-1');
  });

  it('blocks pet type approve without image (AC-036, AC-037)', () => {
    renderWithQueryClient(
      <PendingPetTypeRow
        item={{
          id: 'pet-pending-1',
          name: 'สุนัข',
          slug: 'dog',
          status: 'pending',
          imageUrl: null,
        }}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'อนุมัติ' })).toBeDisabled();
    expect(screen.getByText('ต้องอัปโหลดรูปภาพก่อนอนุมัติ')).toBeInTheDocument();
    expect(screen.getByTestId('mock-image-upload-field')).toHaveAttribute(
      'data-folder',
      'pet-types',
    );
  });

  it('shows admin auto-approve success copy after create (AC-010)', async () => {
    const user = userEvent.setup();
    taxonomyHookMocks.useCreateCategory.mockReturnValue(
      createMutationMock(async () => ({
        id: 'cat-new',
        name: 'หมวดใหม่',
        slug: 'new',
        status: 'approved',
      })) as never,
    );

    renderWithQueryClient(<CategoryCreateCard />);

    await user.type(screen.getByLabelText(/ชื่อหมวดหมู่/), 'หมวดใหม่');
    await user.click(screen.getByRole('button', { name: 'สร้าง' }));

    await waitFor(() => {
      expect(screen.getByText('สร้างแล้ว')).toBeInTheDocument();
    });
    expect(
      screen.getByText(/หมวดหมู่ที่สร้างโดยผู้ดูแลจะได้รับการอนุมัติทันที/),
    ).toBeInTheDocument();
  });
});
