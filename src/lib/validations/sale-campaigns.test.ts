import { describe, expect, it } from 'vitest';
import {
  buildSaleCampaignItemsInput,
  getSaleCampaignFormDefaults,
  saleCampaignFormSchema,
} from './sale-campaigns';

const SAMPLE_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';

describe('saleCampaignFormSchema', () => {
  it('accepts a valid campaign with required percent and optional compare-at', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'ลด 20%',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountPercent: 20,
          compareAtPrice: 349,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid campaign with percent only', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'ลด 20%',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountPercent: 20,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: '',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountPercent: 20,
        },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'name')).toBe(true);
    }
  });

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

  it('rejects an item without a productId', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: '',
          discountPercent: 20,
        },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'items.0.productId');
      expect(issue?.message).toBe('กรุณาเลือกสินค้า');
    }
  });

  it('rejects an item without discountPercent', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [{ productId: SAMPLE_PRODUCT_ID, compareAtPrice: 199 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join('.') === 'items.0.discountPercent');
      expect(issue?.message).toBe('กรุณากรอกเปอร์เซ็นต์ส่วนลด');
    }
  });

  it('rejects discountPercent above 99', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountPercent: 100,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an expiresAt that is before or equal to startsAt', () => {
    const result = saleCampaignFormSchema.safeParse({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญวันที่ผิด',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          discountPercent: 20,
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
          discountPercent: 20,
        },
      ],
      startsAt: '2026-06-01T00:00',
      expiresAt: '2026-06-15T00:00',
    });
    expect(result.success).toBe(true);
  });
});

describe('buildSaleCampaignItemsInput', () => {
  it('strips productName and empty variantId and sends percent plus optional compare-at', () => {
    const result = buildSaleCampaignItemsInput({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
          productName: 'อาหารแมว',
          variantId: '',
          compareAtPrice: 349,
          discountPercent: 20,
        },
      ],
    });
    expect(result).toEqual([
      {
        productId: SAMPLE_PRODUCT_ID,
        variantId: undefined,
        compareAtPrice: 349,
        discountPercent: 20,
      },
    ]);
  });

  it('omits compareAtPrice when not provided', () => {
    const result = buildSaleCampaignItemsInput({
      ...getSaleCampaignFormDefaults(),
      name: 'แคมเปญ',
      items: [
        {
          productId: SAMPLE_PRODUCT_ID,
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
