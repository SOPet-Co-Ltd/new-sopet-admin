import { describe, expect, it } from 'vitest';
import {
  applyOptionRename,
  buildAutoSku,
  buildCombinationsFromGroups,
  compareAtFromDiscountPercent,
  discountPercentFromCompareAt,
  formatCombinationLabel,
  MAX_SKU_LENGTH,
  variantItemsToSyncInput,
} from '@/lib/variants';

describe('applyOptionRename', () => {
  const items = [
    { id: '1', sku: 'A', stockQuantity: 2, price: 100, options: { สี: 'แดง', ไซส์: 'M' } },
    { id: '2', sku: 'B', stockQuantity: 3, price: 120, options: { สี: 'น้ำเงิน', ไซส์: 'M' } },
  ];

  it('rewrites group name on existing items', () => {
    expect(applyOptionRename(items, { type: 'group', from: 'สี', to: 'Color' })).toEqual([
      { ...items[0], options: { Color: 'แดง', ไซส์: 'M' } },
      { ...items[1], options: { Color: 'น้ำเงิน', ไซส์: 'M' } },
    ]);
  });

  it('rewrites a single value while keeping id sku stock and price', () => {
    expect(
      applyOptionRename(items, { type: 'value', group: 'สี', from: 'แดง', to: 'แดงเข้ม' }),
    ).toEqual([{ ...items[0], options: { สี: 'แดงเข้ม', ไซส์: 'M' } }, items[1]]);
  });
});

describe('buildAutoSku', () => {
  it('keeps short slug + option value under the limit', () => {
    expect(buildAutoSku('shampoo', { สี: 'แดง' })).toBe('shampoo-แดง');
  });

  it('truncates long product slugs while keeping the option suffix', () => {
    const longSlug =
      'bactedene-gel-สูตรเดียวกับเบตาดีน-แบคทีดีนเจล-ยาทาแผลแบบเจล-ฆ่าเชื้อโรค-ปฐมพยาบาล-ล้างออกง่าย-ขนาด10กรัม-1';
    const sku = buildAutoSku(longSlug, { ตัวเลือก: 'test' });
    expect(sku.length).toBeLessThanOrEqual(MAX_SKU_LENGTH);
    expect(sku.endsWith('-test')).toBe(true);
  });
});

describe('buildCombinationsFromGroups', () => {
  it('never emits SKUs longer than 100 characters for new combinations', () => {
    const longSlug = 'a'.repeat(120);
    const items = buildCombinationsFromGroups([{ name: 'Size', values: ['xl'] }], [], longSlug);
    expect(items[0]?.sku.length).toBeLessThanOrEqual(MAX_SKU_LENGTH);
  });
});

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
