import { describe, expect, it } from 'vitest';
import {
  getProductListPriceLabel,
  getProductListStockTotal,
  getProductListThumbnailUrl,
} from './list-display';
import type { Product } from '@/types';

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    storeId: 's1',
    name: 'Test',
    slug: 'test',
    basePrice: 100,
    status: 'published',
    tags: [],
    ...overrides,
  };
}

describe('product list display helpers', () => {
  it('formats a single variant price', () => {
    expect(
      getProductListPriceLabel(
        product({
          variants: [{ id: 'v1', sku: 'A', price: 250, stockQuantity: 3 }],
        }),
      ),
    ).toMatch(/250/);
  });

  it('formats a price range across variants', () => {
    const label = getProductListPriceLabel(
      product({
        variants: [
          { id: 'v1', sku: 'A', price: 100, stockQuantity: 1 },
          { id: 'v2', sku: 'B', price: 300, stockQuantity: 2 },
        ],
      }),
    );
    expect(label).toContain('–');
  });

  it('falls back to basePrice when there are no variants', () => {
    expect(getProductListPriceLabel(product({ basePrice: 99 }))).toMatch(/99/);
  });

  it('sums stock across variants', () => {
    expect(
      getProductListStockTotal(
        product({
          variants: [
            { id: 'v1', sku: 'A', price: 1, stockQuantity: 4 },
            { id: 'v2', sku: 'B', price: 1, stockQuantity: 6 },
          ],
        }),
      ),
    ).toBe(10);
  });

  it('prefers thumbnailUrl then marked image then first image', () => {
    expect(getProductListThumbnailUrl(product({ thumbnailUrl: 'https://a/t.jpg' }))).toBe(
      'https://a/t.jpg',
    );
    expect(
      getProductListThumbnailUrl(
        product({
          images: [
            { id: '1', imageUrl: 'https://a/1.jpg', sortOrder: 0 },
            { id: '2', imageUrl: 'https://a/2.jpg', sortOrder: 1, isThumbnail: true },
          ],
        }),
      ),
    ).toBe('https://a/2.jpg');
    expect(
      getProductListThumbnailUrl(
        product({
          images: [{ id: '1', imageUrl: 'https://a/1.jpg', sortOrder: 0 }],
        }),
      ),
    ).toBe('https://a/1.jpg');
  });
});
