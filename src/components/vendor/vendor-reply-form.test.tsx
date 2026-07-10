import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mapProductReview } from '@/lib/graphql/mappers';
import { VendorReviewListItem } from './vendor-review-list-item';
import { REVIEW_REPLY_MAX_LENGTH, VendorReplyForm, mapVendorReplyError } from './vendor-reply-form';
import { ApiError } from '@/lib/api/errors-core';

vi.mock('@/hooks/useReviews', () => ({
  useCreateReviewReply: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useUpdateReviewReply: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

import { useCreateReviewReply, useUpdateReviewReply } from '@/hooks/useReviews';

const mockedUseCreateReviewReply = vi.mocked(useCreateReviewReply);
const mockedUseUpdateReviewReply = vi.mocked(useUpdateReviewReply);

describe('mapProductReview', () => {
  it('maps nested reply and product display fields', () => {
    const mapped = mapProductReview({
      id: 'review-1',
      productId: 'prod-1',
      productName: 'Dog Food',
      productSlug: 'dog-food',
      productImageUrl: 'https://cdn.example.com/dog.jpg',
      rating: 5,
      comment: 'Great',
      status: 'approved',
      createdAt: '2026-01-01T00:00:00.000Z',
      customerName: 'สมชาย ใ.',
      reply: {
        id: 'reply-1',
        body: 'Thank you',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      },
    });

    expect(mapped.productSlug).toBe('dog-food');
    expect(mapped.productImageUrl).toBe('https://cdn.example.com/dog.jpg');
    expect(mapped.reply?.body).toBe('Thank you');
  });
});

describe('VendorReviewListItem', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders thumbnail fallback and empty comment placeholder', () => {
    render(
      <VendorReviewListItem
        storeId="store-1"
        review={{
          id: 'review-1',
          productId: 'prod-1',
          productName: 'Dog Food',
          rating: 4,
          status: 'approved',
        }}
      />,
    );

    expect(screen.getByTestId('product-thumbnail-fallback')).toHaveTextContent('ไม่มีรูป');
    expect(screen.getByText('ไม่มีความคิดเห็น')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ตอบกลับ' })).toBeInTheDocument();
    expect(screen.queryByText('ตอบกลับรีวิว')).not.toBeInTheDocument();
  });

  it('does not render status badge or delete control', () => {
    render(
      <VendorReviewListItem
        storeId="store-1"
        review={{
          id: 'review-1',
          productId: 'prod-1',
          productName: 'Dog Food',
          rating: 4,
          comment: 'Nice',
          status: 'approved',
        }}
      />,
    );

    expect(screen.queryByText('approved')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ลบ/i })).not.toBeInTheDocument();
    expect(screen.getByText('ยังไม่ตอบ')).toBeInTheDocument();
  });

  it('shows reply preview when reply exists', async () => {
    render(
      <VendorReviewListItem
        storeId="store-1"
        review={{
          id: 'review-1',
          productId: 'prod-1',
          productName: 'Dog Food',
          rating: 5,
          comment: 'Great',
          status: 'approved',
          reply: {
            id: 'reply-1',
            body: 'Thank you for your review',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
          },
        }}
      />,
    );

    expect(screen.getByText('ตอบแล้ว')).toBeInTheDocument();
    expect(screen.getByText('Thank you for your review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'แก้ไข' })).toBeInTheDocument();
    expect(screen.queryByText('ตอบกลับรีวิว')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'แก้ไข' }));
    expect(screen.getByText('ตอบกลับรีวิว')).toBeInTheDocument();
  });
});

describe('VendorReplyForm', () => {
  const createMutateAsync = vi.fn();
  const updateMutateAsync = vi.fn();

  beforeEach(() => {
    createMutateAsync.mockReset();
    updateMutateAsync.mockReset();
    mockedUseCreateReviewReply.mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false,
    } as never);
    mockedUseUpdateReviewReply.mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: false,
    } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows create button and blocks whitespace-only submit', async () => {
    render(<VendorReplyForm reviewId="review-1" storeId="store-1" />);

    expect(screen.getByText('ตอบกลับรีวิว')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึกคำตอบ' })).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox'), '   ');
    expect(screen.getByRole('button', { name: 'บันทึกคำตอบ' })).toBeDisabled();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it('calls createReviewReply when no existing reply', async () => {
    createMutateAsync.mockResolvedValue({});
    render(<VendorReplyForm reviewId="review-1" storeId="store-1" />);

    await userEvent.type(screen.getByRole('textbox'), 'Thanks for your review');
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกคำตอบ' }));

    expect(createMutateAsync).toHaveBeenCalledWith({
      reviewId: 'review-1',
      body: 'Thanks for your review',
    });
    expect(updateMutateAsync).not.toHaveBeenCalled();
  });

  it('calls updateReviewReply when reply exists', async () => {
    updateMutateAsync.mockResolvedValue({});
    render(
      <VendorReplyForm
        reviewId="review-1"
        storeId="store-1"
        reply={{
          id: 'reply-1',
          body: 'Old reply',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'อัปเดตคำตอบ' })).toBeDisabled();

    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'Updated reply');
    await userEvent.click(screen.getByRole('button', { name: 'อัปเดตคำตอบ' }));

    expect(updateMutateAsync).toHaveBeenCalledWith({
      replyId: 'reply-1',
      body: 'Updated reply',
    });
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it('shows max length error and blocks submit', async () => {
    render(<VendorReplyForm reviewId="review-1" storeId="store-1" />);
    const longText = 'a'.repeat(REVIEW_REPLY_MAX_LENGTH + 1);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: longText } });

    expect(screen.getByText('ข้อความยาวเกิน 1,000 ตัวอักษร')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'บันทึกคำตอบ' })).toBeDisabled();
  });

  it('shows success message after successful create', async () => {
    createMutateAsync.mockResolvedValue({});
    render(<VendorReplyForm reviewId="review-1" storeId="store-1" />);

    await userEvent.type(screen.getByRole('textbox'), 'Thanks for your review');
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกคำตอบ' }));

    expect(await screen.findByText('บันทึกแล้ว')).toBeInTheDocument();
  });

  it('sets aria-busy on textarea while mutation is pending', () => {
    mockedUseCreateReviewReply.mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: true,
    } as never);

    render(<VendorReplyForm reviewId="review-1" storeId="store-1" />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-busy', 'true');
  });

  it('preserves draft text when mutation fails', async () => {
    createMutateAsync.mockRejectedValue(
      new ApiError({
        code: 'STORE_ACCESS_DENIED',
        message: 'Forbidden',
        status: 403,
      }),
    );
    render(<VendorReplyForm reviewId="review-1" storeId="store-1" />);

    await userEvent.type(screen.getByRole('textbox'), 'Draft text');
    await userEvent.click(screen.getByRole('button', { name: 'บันทึกคำตอบ' }));

    expect(screen.getByRole('textbox')).toHaveValue('Draft text');
    expect(screen.getByText('ไม่มีสิทธิ์ตอบรีวิวนี้')).toBeInTheDocument();
  });
});

describe('mapVendorReplyError', () => {
  it('maps known GraphQL error codes to Thai messages', () => {
    expect(
      mapVendorReplyError(
        new ApiError({ code: 'REVIEW_REPLY_ALREADY_EXISTS', message: 'dup', status: 400 }),
      ),
    ).toBe('มีคำตอบอยู่แล้ว');
  });
});
