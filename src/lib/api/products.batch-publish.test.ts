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

describe('publishProductsBatched', () => {
  beforeEach(() => {
    executeMutation.mockReset();
    executeQuery.mockReset();
  });

  it('continues remaining chunks after a chunk failure and merges results', async () => {
    const { publishProductsBatched, BATCH_PUBLISH_MAX_IDS } = await import('./products');
    const ids = Array.from({ length: BATCH_PUBLISH_MAX_IDS + 2 }, (_, i) => `prod-${i + 1}`);

    executeMutation
      .mockRejectedValueOnce(new Error('เซิร์ฟเวอร์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'))
      .mockResolvedValueOnce({
        publishProducts: {
          publishedCount: 2,
          failedCount: 0,
          publishedIds: ids.slice(BATCH_PUBLISH_MAX_IDS),
          failures: [],
        },
      });

    const progress: Array<{ chunkStart: number; chunkEnd: number; total: number }> = [];
    const result = await publishProductsBatched(ids, (next) => {
      progress.push({
        chunkStart: next.chunkStart,
        chunkEnd: next.chunkEnd,
        total: next.total,
      });
    });

    expect(executeMutation).toHaveBeenCalledTimes(2);
    expect(result.publishedIds).toEqual(ids.slice(BATCH_PUBLISH_MAX_IDS));
    expect(result.publishedCount).toBe(2);
    expect(result.failedCount).toBe(BATCH_PUBLISH_MAX_IDS);
    expect(result.failures).toHaveLength(BATCH_PUBLISH_MAX_IDS);
    expect(result.failures[0]).toMatchObject({
      productId: 'prod-1',
      code: 'CHUNK_FAILED',
      message: 'เซิร์ฟเวอร์ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง',
    });
    expect(progress.some((p) => p.chunkStart === 1 && p.chunkEnd === BATCH_PUBLISH_MAX_IDS)).toBe(
      true,
    );
    expect(
      progress.some(
        (p) =>
          p.chunkStart === BATCH_PUBLISH_MAX_IDS + 1 && p.chunkEnd === BATCH_PUBLISH_MAX_IDS + 2,
      ),
    ).toBe(true);
  });

  it('loads select-all ids via a single IDs-only query', async () => {
    executeQuery.mockResolvedValueOnce({
      vendorPublishableProductIds: {
        ids: ['prod-1', 'prod-2', 'prod-3'],
        total: 3,
      },
    });

    const { getAllVendorPublishableProductIds } = await import('./products');
    const ids = await getAllVendorPublishableProductIds({ search: 'food' });

    expect(ids).toEqual(['prod-1', 'prod-2', 'prod-3']);
    expect(executeQuery).toHaveBeenCalledTimes(1);
    expect(executeQuery.mock.calls[0]?.[1]).toEqual({ search: 'food' });
  });
});
