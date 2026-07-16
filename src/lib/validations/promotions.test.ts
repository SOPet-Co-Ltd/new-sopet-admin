import { describe, expect, it } from 'vitest';
import { promotionTypeMeta } from '@/lib/promotions/metadata';
import {
  buildPromotionConditions,
  getPromotionFormDefaults,
  parsePromotionConditions,
  promotionFormSchema,
} from './promotions';

const SAMPLE_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';

describe('promotionFormSchema', () => {
  /**
   * AC: Valid percentage promotion with discount 1–100 is accepted by client Zod.
   * Behavior: safeParse percentage with discountValue 10 → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 70
   */
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

  /**
   * AC: Percentage discount above 100 is rejected.
   * Behavior: safeParse discountValue 150 → success false
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 72
   */
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

  /**
   * AC: Zero discount for fixed_shipping_discount fails with shipping-specific copy.
   * Behavior: discountValue 0 → issue message contains ส่วนลดค่าจัดส่ง
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 71
   */
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

  /**
   * AC: Empty discount for fixed_amount fails with baht-specific required copy.
   * Behavior: omit discountValue → message กรุณากรอกส่วนลดเป็นบาท (มากกว่า 0)
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 71
   */
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

  /**
   * AC: Zero discount for fixed_amount fails with baht-specific required copy.
   * Behavior: discountValue 0 → message กรุณากรอกส่วนลดเป็นบาท (มากกว่า 0)
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 71
   */
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

  /**
   * AC: Valid fixed_amount promotion is accepted.
   * Behavior: discountValue 50 + minPurchase → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 70
   */
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

  /**
   * AC: Valid fixed_shipping_discount promotion is accepted.
   * Behavior: discountValue 50 → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 70
   */
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

  /**
   * AC: Valid percentage_shipping_discount promotion is accepted.
   * Behavior: discountValue 50 + maxDiscount → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 70
   */
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

  /**
   * AC: percentage_shipping_discount above 100 fails with shipping-specific message.
   * Behavior: discountValue 150 → issue contains ส่วนลดค่าจัดส่ง
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 71
   */
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

  /**
   * AC: percentage_shipping_discount requires value greater than 0.
   * Behavior: discountValue 0 → Thai required message for shipping percent
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 71
   */
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

  /**
   * AC: percentage_shipping_discount requires percent when left empty.
   * Behavior: omit discountValue → Thai required message
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 71
   */
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

  /**
   * AC: buy_x_get_y requires buy/get quantities (AC-023 adjacent).
   * Behavior: omit buy/get → success false
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 74
   */
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

  /**
   * AC: AC-024 — Valid buy_x_get_y with productId + X/Y is accepted (D001 client gate).
   * Behavior: productId + buyQuantity 2 + getQuantity 1 → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 85
   */
  it('accepts a valid buy_x_get_y promotion', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B2G1',
      name: 'ซื้อ 2 แถม 1',
      discountValue: 0,
      usagePerCustomer: 1,
      buyQuantity: 2,
      getQuantity: 1,
      productId: SAMPLE_PRODUCT_ID,
    });
    expect(result.success).toBe(true);
  });

  /**
   * AC: AC-023 — buy_x_get_y without productId is rejected (D001 client gate).
   * Behavior: omit productId → issue path productId with Thai picker message
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 90
   */
  it('rejects buy_x_get_y without productId', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B2G1',
      name: 'Buy 2 Get 1',
      discountValue: 0,
      usagePerCustomer: 1,
      buyQuantity: 2,
      getQuantity: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const productIssue = result.error.issues.find((i) => i.path[0] === 'productId');
      expect(productIssue?.message).toBe('กรุณาเลือกสินค้าสำหรับโปรซื้อแถม');
    }
  });

  /**
   * AC: buy_x_get_y buyQuantity above 99 is rejected.
   * Behavior: buyQuantity 100 → buyQuantity issue present
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 72
   */
  it('rejects buy_x_get_y quantities above 99', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B100G1',
      name: 'Too many',
      discountValue: 0,
      usagePerCustomer: 1,
      buyQuantity: 100,
      getQuantity: 1,
      productId: SAMPLE_PRODUCT_ID,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'buyQuantity')).toBe(true);
    }
  });

  /**
   * AC: Non-integer buy_x_get_y quantities are rejected.
   * Behavior: buyQuantity 2.5 → success false
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 72
   */
  it('rejects non-integer buy_x_get_y quantities', () => {
    const result = promotionFormSchema.safeParse({
      type: 'buy_x_get_y',
      code: 'B2G1',
      name: 'Fractional',
      discountValue: 0,
      usagePerCustomer: 1,
      buyQuantity: 2.5,
      getQuantity: 1,
      productId: SAMPLE_PRODUCT_ID,
    });
    expect(result.success).toBe(false);
  });

  /**
   * AC: AC-001 / AC-031 — newCustomer on percentage with positive nDays is accepted.
   * Behavior: newCustomerOnly true + nDays 30 → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 88
   */
  it('accepts newCustomer on percentage with positive nDays', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage',
      code: 'NEW10',
      name: 'New customer 10%',
      discountValue: 10,
      usagePerCustomer: 1,
      newCustomerOnly: true,
      newCustomerMaxAccountAgeDays: 30,
    });
    expect(result.success).toBe(true);
  });

  /**
   * AC: AC-031 — newCustomer enabled without positive nDays is rejected.
   * Behavior: newCustomerOnly true, omit nDays → Thai empty/≤0 message on N path
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 88
   */
  it('rejects newCustomer enabled without positive nDays', () => {
    const result = promotionFormSchema.safeParse({
      type: 'percentage',
      code: 'NEW10',
      name: 'New customer 10%',
      discountValue: 10,
      usagePerCustomer: 1,
      newCustomerOnly: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nIssue = result.error.issues.find((i) => i.path[0] === 'newCustomerMaxAccountAgeDays');
      expect(nIssue?.message).toBe('กรุณาระบุจำนวนวันเป็นจำนวนเต็มที่มากกว่า 0');
    }
  });

  /**
   * AC: AC-031 — non-integer newCustomer nDays is rejected.
   * Behavior: nDays 30.5 → message ต้องเป็นจำนวนเต็ม
   * @category: edge-case
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 80
   */
  it('rejects non-integer newCustomer nDays', () => {
    const result = promotionFormSchema.safeParse({
      type: 'fixed_amount',
      code: 'NEW50',
      name: 'New customer 50',
      discountValue: 50,
      usagePerCustomer: 1,
      newCustomerOnly: true,
      newCustomerMaxAccountAgeDays: 30.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nIssue = result.error.issues.find((i) => i.path[0] === 'newCustomerMaxAccountAgeDays');
      expect(nIssue?.message).toBe('ต้องเป็นจำนวนเต็ม');
    }
  });

  /**
   * AC: free_shipping with discountValue 0 and optional threshold is accepted.
   * Behavior: free_shipping + minPurchase 500 → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 70
   */
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

  /**
   * AC: free_shipping with no min purchase (full free shipping) is accepted.
   * Behavior: free_shipping omit minPurchase → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionFormSchema
   * @complexity: low
   * ROI: 70
   */
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
  /**
   * AC: buy_x_get_y defaults seed X=2 Y=1.
   * Behavior: getPromotionFormDefaults buy_x_get_y → buyQuantity 2, getQuantity 1
   * @category: core-functionality
   * @lane: unit
   * @dependency: getPromotionFormDefaults
   * @complexity: low
   * ROI: 68
   */
  it('seeds buy_x_get_y quantities', () => {
    expect(getPromotionFormDefaults('buy_x_get_y')).toMatchObject({
      type: 'buy_x_get_y',
      buyQuantity: 2,
      getQuantity: 1,
    });
  });

  /**
   * AC: fixed_shipping_discount discount starts empty so vendors must enter an amount.
   * Behavior: defaults.discountValue undefined
   * @category: core-functionality
   * @lane: unit
   * @dependency: getPromotionFormDefaults
   * @complexity: low
   * ROI: 68
   */
  it('leaves fixed_shipping_discount discount empty so vendors must enter an amount', () => {
    expect(getPromotionFormDefaults('fixed_shipping_discount').discountValue).toBeUndefined();
  });

  /**
   * AC: fixed_amount discount starts empty so vendors must enter an amount.
   * Behavior: defaults.discountValue undefined
   * @category: core-functionality
   * @lane: unit
   * @dependency: getPromotionFormDefaults
   * @complexity: low
   * ROI: 68
   */
  it('leaves fixed_amount discount empty so vendors must enter an amount', () => {
    expect(getPromotionFormDefaults('fixed_amount').discountValue).toBeUndefined();
  });

  /**
   * AC: percentage discount starts empty so vendors must enter a percent.
   * Behavior: defaults.discountValue undefined
   * @category: core-functionality
   * @lane: unit
   * @dependency: getPromotionFormDefaults
   * @complexity: low
   * ROI: 68
   */
  it('leaves percentage discount empty so vendors must enter a percent', () => {
    expect(getPromotionFormDefaults('percentage').discountValue).toBeUndefined();
  });

  /**
   * AC: percentage_shipping_discount starts empty so vendors must enter a percent.
   * Behavior: defaults.discountValue undefined
   * @category: core-functionality
   * @lane: unit
   * @dependency: getPromotionFormDefaults
   * @complexity: low
   * ROI: 68
   */
  it('leaves percentage_shipping_discount empty so vendors must enter a percent', () => {
    expect(getPromotionFormDefaults('percentage_shipping_discount').discountValue).toBeUndefined();
  });

  /**
   * AC: free_shipping seeds discountValue to 0.
   * Behavior: defaults match type free_shipping + discountValue 0
   * @category: core-functionality
   * @lane: unit
   * @dependency: getPromotionFormDefaults
   * @complexity: low
   * ROI: 68
   */
  it('seeds free_shipping discountValue to 0', () => {
    expect(getPromotionFormDefaults('free_shipping')).toMatchObject({
      type: 'free_shipping',
      discountValue: 0,
    });
  });
});

describe('buildPromotionConditions / parsePromotionConditions', () => {
  /**
   * AC: AC-024 — Roundtrip buy/get + productId as camelCase JSON (ADR Decision 1).
   * Behavior: build → parse equals productId, buyQuantity, getQuantity; newCustomer off
   * @category: core-functionality
   * @lane: unit
   * @dependency: buildPromotionConditions, parsePromotionConditions
   * @complexity: medium
   * ROI: 92
   */
  it('round-trips buy/get quantities and productId as camelCase JSON', () => {
    const json = buildPromotionConditions({
      ...getPromotionFormDefaults('buy_x_get_y'),
      code: 'B2G1',
      name: 'Buy 2 Get 1',
      discountValue: 0,
      productId: SAMPLE_PRODUCT_ID,
    });
    expect(json).toBeDefined();
    expect(JSON.parse(json!)).toEqual({
      productId: SAMPLE_PRODUCT_ID,
      buyQuantity: 2,
      getQuantity: 1,
    });
    expect(parsePromotionConditions(json)).toEqual({
      productId: SAMPLE_PRODUCT_ID,
      buyQuantity: 2,
      getQuantity: 1,
      newCustomerOnly: false,
      newCustomerMaxAccountAgeDays: undefined,
    });
  });

  /**
   * AC: AC-001 / AC-002 — Emits newCustomer on percentage; omits when off.
   * Behavior: enabled → { newCustomer: { enabled, nDays } }; off → undefined
   * @category: core-functionality
   * @lane: unit
   * @dependency: buildPromotionConditions
   * @complexity: medium
   * ROI: 92
   */
  it('emits newCustomer on percentage and omits when off', () => {
    const withNewCustomer = buildPromotionConditions({
      ...getPromotionFormDefaults('percentage'),
      code: 'NEW10',
      name: 'New 10%',
      discountValue: 10,
      newCustomerOnly: true,
      newCustomerMaxAccountAgeDays: 30,
    });
    expect(JSON.parse(withNewCustomer!)).toEqual({
      newCustomer: { enabled: true, nDays: 30 },
    });

    const without = buildPromotionConditions({
      ...getPromotionFormDefaults('percentage'),
      code: 'SAVE10',
      name: '10%',
      discountValue: 10,
      newCustomerOnly: false,
    });
    expect(without).toBeUndefined();
  });

  /**
   * AC: ADR sample shape — BxGy + newCustomer camelCase keys match Backend DD.
   * Behavior: build JSON equals { newCustomer, productId, buyQuantity, getQuantity }
   * @category: core-functionality
   * @lane: unit
   * @dependency: buildPromotionConditions
   * @complexity: medium
   * ROI: 95
   */
  it('emits ADR sample shape for BxGy + newCustomer', () => {
    const json = buildPromotionConditions({
      ...getPromotionFormDefaults('buy_x_get_y'),
      code: 'B2G1',
      name: 'Buy 2 Get 1',
      discountValue: 0,
      productId: SAMPLE_PRODUCT_ID,
      buyQuantity: 2,
      getQuantity: 1,
      newCustomerOnly: true,
      newCustomerMaxAccountAgeDays: 30,
    });
    expect(JSON.parse(json!)).toEqual({
      newCustomer: { enabled: true, nDays: 30 },
      productId: SAMPLE_PRODUCT_ID,
      buyQuantity: 2,
      getQuantity: 1,
    });
  });

  /**
   * AC: parsePromotionConditions maps persisted newCustomer + productId into form fields.
   * Behavior: JSON blob → newCustomerOnly, nDays, productId, buy/get
   * @category: core-functionality
   * @lane: unit
   * @dependency: parsePromotionConditions
   * @complexity: low
   * ROI: 86
   */
  it('parses newCustomer and productId from persisted conditions', () => {
    expect(
      parsePromotionConditions(
        JSON.stringify({
          newCustomer: { enabled: true, nDays: 14 },
          productId: SAMPLE_PRODUCT_ID,
          buyQuantity: 3,
          getQuantity: 1,
        }),
      ),
    ).toEqual({
      newCustomerOnly: true,
      newCustomerMaxAccountAgeDays: 14,
      productId: SAMPLE_PRODUCT_ID,
      buyQuantity: 3,
      getQuantity: 1,
    });
  });

  /**
   * AC: Invalid conditions JSON soft-fails to empty object.
   * Behavior: parse '{not-json' → {}
   * @category: edge-case
   * @lane: unit
   * @dependency: parsePromotionConditions
   * @complexity: low
   * ROI: 75
   */
  it('returns empty object for invalid JSON', () => {
    expect(parsePromotionConditions('{not-json')).toEqual({});
  });
});

describe('promotionTypeMeta AC-017 / Rule A copy', () => {
  /**
   * AC: AC-017 — fixed_amount metadata describes order/store-subtotal baht-off, not per-product.
   * Behavior: description/hint/rulesSectionDescription match order/store clamp wording
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionTypeMeta.fixed_amount
   * @complexity: low
   * ROI: 84
   */
  it('describes fixed_amount as order/store-subtotal baht-off not per-product', () => {
    const meta = promotionTypeMeta.fixed_amount;
    expect(meta.description).toMatch(/ยอดสินค้าทั้งออเดอร์|ยอดสินค้าของร้าน/);
    expect(meta.description).toMatch(/ไม่ลดทีละชิ้น/);
    expect(meta.discountHint).toMatch(/หักเป็นบาทจากยอดที่ใช้ได้/);
    expect(meta.discountHint).toMatch(/ลดเท่าที่ยอด/);
    expect(meta.rulesSectionDescription).toMatch(/ไม่ใช่ต่อชิ้น/);
  });

  /**
   * AC: AC-017 / Rule A — buy_x_get_y metadata uses selected-product set math; not store-wide-only.
   * Behavior: description mentions สินค้าที่เลือก + ชุด X+Y; buyGetRuleHint has floor; no legacy store-wide claim
   * @category: core-functionality
   * @lane: unit
   * @dependency: promotionTypeMeta.buy_x_get_y
   * @complexity: low
   * ROI: 84
   */
  it('describes buy_x_get_y Rule A set math for selected product', () => {
    const meta = promotionTypeMeta.buy_x_get_y;
    expect(meta.description).toMatch(/สินค้าที่เลือก/);
    expect(meta.description).toMatch(/ชุด X\+Y/);
    expect(meta.buyGetRuleHint).toMatch(/floor/);
    expect(meta.buyGetRuleHint).not.toMatch(/ยังไม่รองรับเลือกสินค้า/);
  });
});
