import { describe, expect, it } from 'vitest';
import {
  buildSaleCampaignItemsInput,
  getSaleCampaignFormDefaults,
  saleCampaignFormSchema,
} from './sale-campaigns';

const SAMPLE_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';

describe('saleCampaignFormSchema', () => {
  /**
   * AC: A valid campaign with a name and one item (compareAtPrice) is accepted.
   * Behavior: safeParse name + one item with compareAtPrice → success
   * @category: core-functionality
   * @lane: unit
   * @dependency: saleCampaignFormSchema
   * @complexity: low
   * ROI: 75
   */
  it('accepts a valid campaign with a compareAtPrice item', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'ลดราคาส่งท้ายปี',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountType: 'compare_at',
          compareAtPrice: 199,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid campaign with a discountPercent item', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'ลด 20%',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountType: 'percent',
          discountPercent: 20,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  /**
   * AC: Name is required.
   * Behavior: omit name → success false
   * @category: edge-case
   * @lane: unit
   * @dependency: saleCampaignFormSchema
   * @complexity: low
   * ROI: 70
   */
  it('rejects an empty name', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: '',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountType: 'compare_at',
          compareAtPrice: 199,
        },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'name')).toBe(true);
    }
  });

  /**
   * AC: At least one item is required.
   * Behavior: empty items array → success false with issue on items path
   * @category: edge-case
   * @lane: unit
   * @dependency: saleCampaignFormSchema
   * @complexity: low
   * ROI: 78
   */
  it('rejects a campaign with no items', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญไม่มีสินค้า',
      items: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'items')).toBe(true);
    }
  });

  /**
   * AC: Each item requires productId.
   * Behavior: item without productId → issue on items.0.productId
   * @category: edge-case
   * @lane: unit
   * @dependency: saleCampaignFormSchema
   * @complexity: low
   * ROI: 76
   */
  it('rejects an item without a productId', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: '',
          discountType: 'compare_at',
          compareAtPrice: 199,
        },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'items.0.productId');
      expect(issue?.message).toBe('กรุณาเลือกสินค้า');
    }
  });

  /**
   * AC: Each item requires the value matching the selected discount type.
   * Behavior: percent mode without discountPercent → issue on items.0.discountPercent
   * @category: edge-case
   * @lane: unit
   * @dependency: saleCampaignFormSchema
   * @complexity: low
   * ROI: 82
   */
  it('rejects an item with neither compareAtPrice nor discountPercent', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [{ productId: SAMPLE_PRODUCT_ID, discountType: 'percent' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'items.0.discountPercent');
      expect(issue?.message).toBe('กรุณากรอกเปอร์เซ็นต์ส่วนลด');
    }
  });

  it('rejects compare_at mode when compareAtPrice is missing', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [{ productId: SAMPLE_PRODUCT_ID, discountType: 'compare_at' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'items.0.compareAtPrice');
      expect(issue?.message).toBe('กรุณากรอกราคาเปรียบเทียบ');
    }
  });

  /**
   * AC: discountPercent must be within 1–99.
   * Behavior: discountPercent 100 → success false
   * @category: edge-case
   * @lane: unit
   * @dependency: saleCampaignFormSchema
   * @complexity: low
   * ROI: 72
   */
  it('rejects discountPercent above 99', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountType: 'percent',
          discountPercent: 100,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  /**
   * AC: expiresAt must be after startsAt.
   * Behavior: expiresAt before startsAt → issue on expiresAt path
   * @category: edge-case
   * @lane: unit
   * @dependency: saleCampaignFormSchema
   * @complexity: low
   * ROI: 74
   */
  it('rejects an expiresAt that is before or equal to startsAt', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญวันที่ผิด',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountType: 'compare_at',
          compareAtPrice: 199,
        },
      ],
      startsAt: '2026-06-15T00:00',
      expiresAt: '2026-06-01T00:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'expiresAt');
      expect(issue?.message).toBe('วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น');
    }
  });

  it('accepts an expiresAt that is after startsAt', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญวันที่ถูก',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountType: 'compare_at',
          compareAtPrice: 199,
        },
      ],
      startsAt: '2026-06-01T00:00',
      expiresAt: '2026-06-15T00:00',
    });
    expect(result.success).toBe(true);
  });
});

describe('buildSaleCampaignItemsInput', () => {
  /**
   * AC: Item input strips form-local productName and empty variantId.
   * Behavior: form values → SaleCampaignItemInput without productName, variantId undefined
   * @category: core-functionality
   * @lane: unit
   * @dependency: buildSaleCampaignItemsInput
   * @complexity: low
   * ROI: 68
   */
  it('strips productName and empty variantId from item input', () => {
    const result = buildSaleCampaignItemsInput({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          productName: 'อาหารแมว',
          variantId: '',
          discountType: 'compare_at',
          compareAtPrice: 199,
          discountPercent: 20,
        },
      ],
    });
    expect(result).toEqual([
      {
        productId: SAMPLE_PRODUCT_ID,
        variantId: undefined,
        compareAtPrice: 199,
        discountPercent: undefined,
      },
    ]);
  });

  it('sends only discountPercent when percent mode is selected', () => {
    const result = buildSaleCampaignItemsInput({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountType: 'percent',
          compareAtPrice: 199,
          discountPercent: 20,
        },
      ],
    });
    expect(result).toEqual([
      {
        productId: SAMPLE_PRODUCT_ID,
        variantId: undefined,
        compareAtPrice: undefined,
        discountPercent: 20,
      },
    ]);
  });
});
