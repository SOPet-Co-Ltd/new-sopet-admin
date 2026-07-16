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

  it('rejects zero discount for fixed_shipping_discount with shipping-specific copy', () => {
    const result = promotionFormSchema.safeParse({
      type: 'fixed_shipping_discount',
      code: 'SHIP50',
      name: 'ลดค่าส่ง 50',
      discountValue: 0,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const discountIssue = result.error.issues.find((i) => i.path[0] === 'discountValue');
      expect(discountIssue?.message).toContain('ส่วนลดค่าจัดส่ง');
    }
  });

  it('rejects empty discount for fixed_amount with baht-specific copy', () => {
    const result = promotionFormSchema.safeParse({
      type: 'fixed_amount',
      code: 'SAVE50',
      name: 'ลด 50 บาท',
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const discountIssue = result.error.issues.find((i) => i.path[0] === 'discountValue');
      expect(discountIssue?.message).toBe('กรุณากรอกส่วนลดเป็นบาท (มากกว่า 0)');
    }
  });

  it('rejects zero discount for fixed_amount with baht-specific copy', () => {
    const result = promotionFormSchema.safeParse({
      type: 'fixed_amount',
      code: 'SAVE50',
      name: 'ลด 50 บาท',
      discountValue: 0,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const discountIssue = result.error.issues.find((i) => i.path[0] === 'discountValue');
      expect(discountIssue?.message).toBe('กรุณากรอกส่วนลดเป็นบาท (มากกว่า 0)');
    }
  });

  it('accepts a valid fixed_amount promotion', () => {
    const result = promotionFormSchema.safeParse({
      type: 'fixed_amount',
      code: 'SAVE50',
      name: 'ลด 50 บาท',
      discountValue: 50,
      minPurchaseAmount: 300,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid fixed_shipping_discount promotion', () => {
    const result = promotionFormSchema.safeParse({
      type: 'fixed_shipping_discount',
      code: 'SHIP50',
      name: 'ลดค่าส่ง 50',
      discountValue: 50,
      minPurchaseAmount: 300,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid percentage_shipping_discount promotion', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage_shipping_discount',
      code: 'SHIP50PCT',
      name: 'ลดค่าส่ง 50%',
      discountValue: 50,
      maxDiscountAmount: 100,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects percentage_shipping_discount above 100 with shipping-specific message', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage_shipping_discount',
      code: 'SHIP150',
      name: 'Too Big Shipping',
      discountValue: 150,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const discountIssue = result.error.issues.find((i) => i.path[0] === 'discountValue');
      expect(discountIssue?.message).toContain('ส่วนลดค่าจัดส่ง');
    }
  });

  it('requires percentage_shipping_discount greater than 0', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage_shipping_discount',
      code: 'SHIP0',
      name: 'Zero Shipping',
      discountValue: 0,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const discountIssue = result.error.issues.find((i) => i.path[0] === 'discountValue');
      expect(discountIssue?.message).toBe('กรุณากรอกเปอร์เซ็นต์ส่วนลดค่าจัดส่ง (1–100)');
    }
  });

  it('requires percentage_shipping_discount percent when left empty', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage_shipping_discount',
      code: 'SHIP50PCT',
      name: 'ลดค่าส่ง 50%',
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const discountIssue = result.error.issues.find((i) => i.path[0] === 'discountValue');
      expect(discountIssue?.message).toBe('กรุณากรอกเปอร์เซ็นต์ส่วนลดค่าจัดส่ง (1–100)');
    }
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

  it('accepts a valid buy_x_get_y promotion', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B2G1',
      name: 'ซื้อ 2 แถม 1',
      discountValue: 0,
      usagePerCustomer: 1,
      buyQuantity: 2,
      getQuantity: 1,
    });
    expect(result.success).toBe(true);
  });

  it('rejects buy_x_get_y quantities above 99', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B100G1',
      name: 'Too many',
      discountValue: 0,
      usagePerCustomer: 1,
      buyQuantity: 100,
      getQuantity: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'buyQuantity')).toBe(true);
    }
  });

  it('rejects non-integer buy_x_get_y quantities', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B2G1',
      name: 'Fractional',
      discountValue: 0,
      usagePerCustomer: 1,
      buyQuantity: 2.5,
      getQuantity: 1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts free_shipping with discountValue 0 and optional threshold', () => {
    const result = promotionFormSchema.safeParse({
      type: 'free_shipping',
      code: 'FREESHIP',
      name: 'จัดส่งฟรี',
      discountValue: 0,
      minPurchaseAmount: 500,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(true);
  });

  it('accepts free_shipping with no min purchase (full free shipping)', () => {
    const result = promotionFormSchema.safeParse({
      type: 'free_shipping',
      code: 'FREESHIP0',
      name: 'จัดส่งฟรีทุกรายการ',
      discountValue: 0,
      usagePerCustomer: 1,
    });
    expect(result.success).toBe(true);
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

  it('leaves fixed_shipping_discount discount empty so vendors must enter an amount', () => {
    expect(getPromotionFormDefaults('fixed_shipping_discount').discountValue).toBeUndefined();
  });

  it('leaves fixed_amount discount empty so vendors must enter an amount', () => {
    expect(getPromotionFormDefaults('fixed_amount').discountValue).toBeUndefined();
  });

  it('leaves percentage discount empty so vendors must enter a percent', () => {
    expect(getPromotionFormDefaults('percentage').discountValue).toBeUndefined();
  });

  it('leaves percentage_shipping_discount empty so vendors must enter a percent', () => {
    expect(getPromotionFormDefaults('percentage_shipping_discount').discountValue).toBeUndefined();
  });

  it('seeds free_shipping discountValue to 0', () => {
    expect(getPromotionFormDefaults('free_shipping')).toMatchObject({
      type: 'free_shipping',
      discountValue: 0,
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
