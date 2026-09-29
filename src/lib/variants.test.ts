import { describe, expect, it } from 'vitest';
import {
  compareAtFromDiscountPercent,
  discountPercentFromCompareAt,
  formatCombinationLabel,
  variantItemsToSyncInput,
} from '@/lib/variants';

describe('formatCombinationLabel', () => {
  it('sorts option keys before joining with middle-dot separator', () => {
    expect(formatCombinationLabel({ รสชาติ: 'ปลาแซลมอน', ขนาด: '1.5kg' })).toBe(
      'ขนาด: 1.5kg · รสชาติ: ปลาแซลมอน',
    );
  });

  it('returns empty string for empty options', () => {
    expect(formatCombinationLabel({})).toBe('');
  });
});

describe('compare-at discount helpers', () => {
  it('computes compare-at from percent off sell price', () => {
    expect(compareAtFromDiscountPercent(750, 25)).toBe(1000);
  });

  it('returns null for invalid percent', () => {
    expect(compareAtFromDiscountPercent(750, 0)).toBeNull();
    expect(compareAtFromDiscountPercent(750, 100)).toBeNull();
  });

  it('computes percent from compare-at', () => {
    expect(discountPercentFromCompareAt(750, 1000)).toBe(25);
  });
});

describe('variantItemsToSyncInput', () => {
  it('includes absolute price and compareAtPrice (including null) in sync payload', () => {
    expect(
      variantItemsToSyncInput([
        {
          sku: 'A',
          stockQuantity: 1,
          price: 100,
          compareAtPrice: 150,
          options: { size: 'M' },
        },
        {
          sku: 'B',
          stockQuantity: 2,
          price: 200,
          compareAtPrice: null,
          options: { size: 'L' },
        },
      ]),
    ).toEqual([
      {
        id: undefined,
        sku: 'A',
        stockQuantity: 1,
        price: 100,
        compareAtPrice: 150,
        attributes: { size: 'M' },
      },
      {
        id: undefined,
        sku: 'B',
        stockQuantity: 2,
        price: 200,
        compareAtPrice: null,
        attributes: { size: 'L' },
      },
    ]);
  });

  it('sends absolute price below a prior product base without clamping', () => {
    expect(
      variantItemsToSyncInput([
        {
          sku: 'LOW',
          stockQuantity: 1,
          price: 400,
          options: { size: '30ml' },
        },
      ]),
    ).toEqual([
      {
        id: undefined,
        sku: 'LOW',
        stockQuantity: 1,
        price: 400,
        compareAtPrice: null,
        attributes: { size: '30ml' },
      },
    ]);
  });
});
