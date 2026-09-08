import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminImportedReview } from '@/lib/api/admin-reviews';
import AdminReviewsPage from './page';

const mutateApprove = vi.fn();
const mutateReject = vi.fn();
const mutateAsyncBatch = vi.fn();
const getPendingIds = vi.fn();
const showToast = vi.fn();

const reviews: AdminImportedReview[] = [
  {
    id: 'review-1',
    productId: 'prod-1',
    productName: 'อาหารสุนัข',
    productSlug: 'dog-food',
    rating: 5,
    comment: 'ดีมาก',
    status: 'pending',
    source: 'vendor_import',
    customerName: 'ลูกค้าไม่ระบุชื่อ',
    createdAt: '2026-01-01T00:00:00.000Z',
    images: [],
  },
  {
    id: 'review-2',
    productId: 'prod-2',
    productName: 'อาหารแมว',
    productSlug: 'cat-food',
    rating: 4,
    comment: 'โอเค',
    status: 'pending',
    source: 'vendor_import',
    customerName: 'ลูกค้าไม่ระบุชื่อ',
    createdAt: '2026-01-02T00:00:00.000Z',
    images: [{ id: 'img-1', url: 'https://example.com/a.jpg' }],
  },
];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/reviews',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/hooks/useAdminReviews', () => ({
  usePendingImportedReviews: () => ({
    data: {
      items: reviews,
      pagination: { page: 1, limit: 20, total: 3, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
  }),
  useApproveReview: () => ({
    mutate: mutateApprove,
    isPending: false,
    variables: undefined,
  }),
  useRejectReview: () => ({
    mutate: mutateReject,
    isPending: false,
    variables: undefined,
  }),
  useApproveReviews: () => ({
    mutateAsync: mutateAsyncBatch,
    isPending: false,
  }),
}));

vi.mock('@/lib/api/admin-reviews', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/api/admin-reviews')>('@/lib/api/admin-reviews');
  return {
    ...actual,
    getPendingImportedReviewIds: (...args: unknown[]) => getPendingIds(...args),
  };
});

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

describe('AdminReviewsPage batch approve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPendingIds.mockResolvedValue(['review-1', 'review-2', 'review-3']);
    mutateAsyncBatch.mockResolvedValue({
      approvedCount: 2,
      failedCount: 0,
      approvedIds: ['review-1', 'review-2'],
      failures: [],
    });
  });

  it('approves selected review ids via batch mutation', async () => {
    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    await user.click(screen.getByRole('checkbox', { name: /อาหารสุนัข/ }));
    await user.click(screen.getByRole('checkbox', { name: /อาหารแมว/ }));
    expect(screen.getByText(/เลือกแล้ว 2/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'อนุมัติที่เลือก' }));

    expect(mutateAsyncBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: expect.arrayContaining(['review-1', 'review-2']),
      }),
    );
    expect(showToast).toHaveBeenCalledWith('อนุมัติแล้ว 2 รายการ', 'success');
  });

  it('select-all loads every pending id, not only the current page', async () => {
    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    await user.click(screen.getByRole('checkbox', { name: 'เลือกทั้งหมด' }));

    expect(getPendingIds).toHaveBeenCalled();
    expect(screen.getByText(/เลือกแล้ว 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'อนุมัติที่เลือก' })).toBeEnabled();
  });

  it('shows toast and failure messages on partial failure', async () => {
    mutateAsyncBatch.mockResolvedValue({
      approvedCount: 1,
      failedCount: 1,
      approvedIds: ['review-1'],
      failures: [
        {
          reviewId: 'review-2',
          code: 'INVALID_REVIEW_STATUS',
          message: 'Only pending reviews can be approved',
        },
      ],
    });

    const user = userEvent.setup();
    render(<AdminReviewsPage />);

    await user.click(screen.getByRole('checkbox', { name: /อาหารสุนัข/ }));
    await user.click(screen.getByRole('checkbox', { name: /อาหารแมว/ }));
    await user.click(screen.getByRole('button', { name: 'อนุมัติที่เลือก' }));

    expect(showToast).toHaveBeenCalledWith('อนุมัติแล้ว 1 รายการ ไม่สำเร็จ 1 รายการ', 'info');
    expect(screen.getByText('Only pending reviews can be approved')).toBeInTheDocument();
  });
});
