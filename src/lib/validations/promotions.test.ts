import { describe, expect, it } from 'vitest';
import {
  buildPromotionConditions,
  getPromotionFormDefaults,
  parsePromotionConditions,
  promotionFormSchema,
} from './promotions';

describe('promotionFormSchema', () => {
  it('accepts a valid percentage promotion', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage',
      code: 'SAVE10',
      name: '10% Off',
      discountValue: 10,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects percentage discount above 100', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage',
      code: 'TOOBIG',
      name: 'Too Big',
      discountValue: 150,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
  });

  it('requires buy/get quantities for buy_x_get_y', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B2G1',
      name: 'Buy 2 Get 1',
      discountValue: 0,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe('getPromotionFormDefaults', () => {
  it('seeds buy_x_get_y quantities', () => {
    expect(getPromotionFormDefaults('buy_x_get_y')).toMatchObject({
      type: 'buy_x_get_y',
      buyQuantity: 2,
      getQuantity: 1,
    });
  });
});

describe('buildPromotionConditions / parsePromotionConditions', () => {
  it('round-trips buy/get quantities as JSON', () => {
    const json = buildPromotionConditions({
      ...getPromotionFormDefaults('buy_x_get_y'),
      code: 'B2G1',
      name: 'Buy 2 Get 1',
      discountValue: 0,
    });
    expect(json).toBeDefined();
    expect(parsePromotionConditions(json)).toEqual({
      buyQuantity: 2,
      getQuantity: 1,
    });
  });

  it('returns empty object for invalid JSON', () => {
    expect(parsePromotionConditions('{not-json')).toEqual({});
  });
});
