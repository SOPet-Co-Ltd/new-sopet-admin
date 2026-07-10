import { describe, expect, it } from 'vitest';
import type { ProductReview } from '@/types';
import { filterReviews } from '@/lib/vendor/review-filters';

const sampleReviews: ProductReview[] = [
  {
    id: '1',
    productId: 'p1',
    rating: 5,
    status: 'approved',
    reply: { id: 'r1', body: 'Thanks', createdAt: '', updatedAt: '' },
  },
  {
    id: '2',
    productId: 'p2',
    rating: 3,
    status: 'approved',
  },
  {
    id: '3',
    productId: 'p3',
    rating: 5,
    status: 'approved',
  },
];

describe('filterReviews', () => {
  it('returns all reviews when filters are default', () => {
    expect(filterReviews(sampleReviews, 'all', 'all')).toHaveLength(3);
  });

  it('filters unreplied reviews only', () => {
    const result = filterReviews(sampleReviews, 'unreplied', 'all');
    expect(result).toHaveLength(2);
    expect(result.every((review) => !review.reply)).toBe(true);
  });

  it('filters replied reviews only', () => {
    const result = filterReviews(sampleReviews, 'replied', 'all');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('applies AND logic for reply and rating filters', () => {
    const result = filterReviews(sampleReviews, 'unreplied', '5');
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('3');
  });
});
