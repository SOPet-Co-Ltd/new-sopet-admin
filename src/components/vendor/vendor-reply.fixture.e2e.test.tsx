import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorReviewListItem } from '@/components/vendor/vendor-review-list-item';

const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();

vi.mock('@/hooks/useReviews', () => ({
  useCreateReviewReply: vi.fn(() => ({
    mutateAsync: createMutateAsync,
    isPending: false,
  })),
  useUpdateReviewReply: vi.fn(() => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
  })),
}));

// AC-001, AC-005, AC-008: Vendor reply create journey on review row.
// @category: fixture-e2e
// @lane: fixture-e2e

describe('Vendor reply fixture-e2e', () => {
  beforeEach(() => {
    createMutateAsync.mockReset();
    updateMutateAsync.mockReset();
    createMutateAsync.mockResolvedValue({
      id: 'reply-1',
      body: 'Thanks for your feedback',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('expands reply form, creates reply, and collapses to preview without delete control', async () => {
    const user = userEvent.setup();

    render(
      <VendorReviewListItem
        storeId="store-1"
        review={{
          id: 'review-1',
          productId: 'prod-1',
          productName: 'Dog Food',
          productImageUrl: 'https://cdn.example.com/dog.jpg',
          rating: 5,
          comment: 'Great product',
          status: 'approved',
        }}
      />,
    );

    expect(screen.getByTestId('product-thumbnail-image')).toBeInTheDocument();
    expect(screen.getByText('Great product')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ลบ/i })).not.toBeInTheDocument();
    expect(screen.queryByText('ตอบกลับรีวิว')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ตอบกลับ' }));
    expect(screen.getByText('ตอบกลับรีวิว')).toBeInTheDocument();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Thanks for your feedback' } });
    await user.click(screen.getByRole('button', { name: 'บันทึกคำตอบ' }));

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        reviewId: 'review-1',
        body: 'Thanks for your feedback',
      });
    });

    expect(await screen.findByText('Thanks for your feedback')).toBeInTheDocument();
    expect(screen.queryByText('ตอบกลับรีวิว')).not.toBeInTheDocument();
  });
});
