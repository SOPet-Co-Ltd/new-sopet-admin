import { beforeEach, describe, expect, it, vi } from 'vitest';

const executeMutation = vi.fn();
const executeQuery = vi.fn();

vi.mock('@/lib/graphql/client', () => ({
  executeMutation: (...args: unknown[]) => executeMutation(...args),
  executeQuery: (...args: unknown[]) => executeQuery(...args),
}));

vi.mock('@/lib/api/errors', () => ({
  getErrorMessage: (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback,
}));

describe('approveReviewsBatched', () => {
  beforeEach(() => {
    executeMutation.mockReset();
    executeQuery.mockReset();
  });

  it('continues remaining chunks after a chunk failure and merges results', async () => {
    const { approveReviewsBatched, BATCH_APPROVE_MAX_IDS } = await import('./admin-reviews');
    const ids = Array.from({ length: BATCH_APPROVE_MAX_IDS + 2 }, (_, i) => `review-${i + 1}`);

    executeMutation
      .mockRejectedValueOnce(new Error('เซิร์ฟเวอร์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'))
      .mockResolvedValueOnce({
        approveReviews: {
          approvedCount: 2,
          failedCount: 0,
          approvedIds: ids.slice(BATCH_APPROVE_MAX_IDS),
          failures: [],
        },
      });

    const progress: Array<{ chunkStart: number; chunkEnd: number; total: number }> = [];
    const result = await approveReviewsBatched(ids, (next) => {
      progress.push({
        chunkStart: next.chunkStart,
        chunkEnd: next.chunkEnd,
        total: next.total,
      });
    });

    expect(executeMutation).toHaveBeenCalledTimes(2);
    expect(result.approvedIds).toEqual(ids.slice(BATCH_APPROVE_MAX_IDS));
    expect(result.approvedCount).toBe(2);
    expect(result.failedCount).toBe(BATCH_APPROVE_MAX_IDS);
    expect(result.failures).toHaveLength(BATCH_APPROVE_MAX_IDS);
    expect(result.failures[0]).toMatchObject({
      reviewId: 'review-1',
      code: 'CHUNK_FAILED',
      message: 'เซิร์ฟเวอร์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
    });
    expect(progress.some((p) => p.chunkStart === 1 && p.chunkEnd === BATCH_APPROVE_MAX_IDS)).toBe(
      true,
    );
    expect(
      progress.some(
        (p) =>
          p.chunkStart === BATCH_APPROVE_MAX_IDS + 1 && p.chunkEnd === BATCH_APPROVE_MAX_IDS + 2,
      ),
    ).toBe(true);
  });

  it('loads select-all ids via a single IDs-only query', async () => {
    executeQuery.mockResolvedValueOnce({
      pendingImportedReviewIds: {
        ids: ['review-1', 'review-2', 'review-3'],
        total: 3,
      },
    });

    const { getPendingImportedReviewIds } = await import('./admin-reviews');
    const ids = await getPendingImportedReviewIds();

    expect(ids).toEqual(['review-1', 'review-2', 'review-3']);
    expect(executeQuery).toHaveBeenCalledTimes(1);
  });
});
