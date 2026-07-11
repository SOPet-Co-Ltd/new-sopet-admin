import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VendorReviewsPage from '@/app/vendor/reviews/page';

const createReviewReply = vi.fn();

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(() => 'store-1'),
}));

vi.mock('@/hooks/useReviews', () => ({
  useStoreReviewSummary: vi.fn(),
  useStoreProductReviews: vi.fn(),
  useCreateReviewReply: vi.fn(() => ({
    mutateAsync: createReviewReply,
    isPending: false,
  })),
  useUpdateReviewReply: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

import { useStoreProductReviews, useStoreReviewSummary } from '@/hooks/useReviews';

const mockedUseStoreReviewSummary = vi.mocked(useStoreReviewSummary);
const mockedUseStoreProductReviews = vi.mocked(useStoreProductReviews);

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const summaryFixture = {
  averageRating: 4.6,
  reviewCount: 2,
  rating5Count: 1,
  rating4Count: 1,
  rating3Count: 0,
  rating2Count: 0,
  rating1Count: 0,
  productBreakdown: [
    {
      productId: 'prod-1',
      productName: 'Dog Food',
      averageRating: 4.6,
      reviewCount: 2,
    },
  ],
};

const reviewsFixture = {
  items: [
    {
      id: 'review-1',
      productId: 'prod-1',
      productName: 'Dog Food',
      productSlug: 'dog-food',
      productImageUrl: 'https://cdn.example.com/dog.jpg',
      rating: 5,
      comment: 'Great',
      status: 'approved',
      reply: null,
    },
    {
      id: 'review-2',
      productId: 'prod-2',
      productName: 'Cat Food',
      productSlug: 'cat-food',
      productImageUrl: null,
      rating: 4,
      comment: 'Nice',
      status: 'approved',
      reply: {
        id: 'reply-1',
        body: 'Thanks',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    },
  ],
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
};

describe('Vendor reviews redesign integration', () => {
  beforeEach(() => {
    createReviewReply.mockReset();
    createReviewReply.mockResolvedValue({
      id: 'reply-new',
      body: 'Happy to help',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    mockedUseStoreReviewSummary.mockReturnValue({
      data: summaryFixture,
      isLoading: false,
      error: null,
    } as never);

    mockedUseStoreProductReviews.mockReturnValue({
      data: reviewsFixture,
      isLoading: false,
      error: null,
    } as never);
  });

  it('renders summary, breakdown, and collapsed reply controls by default', () => {
    renderWithQueryClient(<VendorReviewsPage />);

    expect(screen.getAllByText('4.6').length).toBeGreaterThan(0);
    expect(screen.getByText('รีวิวตามสินค้า')).toBeInTheDocument();
    expect(screen.getAllByText('Dog Food').length).toBeGreaterThan(0);
    expect(screen.getByText('ยังไม่ตอบ')).toBeInTheDocument();
    expect(screen.getByText('ตอบแล้ว')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ตอบกลับ' })).toBeInTheDocument();
    expect(screen.queryByText('ตอบกลับรีวิว')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ลบ/i })).not.toBeInTheDocument();
  });

  it('shows replied review preview collapsed by default', () => {
    mockedUseStoreProductReviews.mockReturnValue({
      data: {
        items: [reviewsFixture.items[1]],
        pagination: reviewsFixture.pagination,
      },
      isLoading: false,
      error: null,
    } as never);

    renderWithQueryClient(<VendorReviewsPage />);

    expect(screen.getByText('Thanks')).toBeInTheDocument();
    expect(screen.getByText('ตอบแล้ว')).toBeInTheDocument();
    expect(screen.queryByText('ตอบกลับรีวิว')).not.toBeInTheDocument();
  });
});
