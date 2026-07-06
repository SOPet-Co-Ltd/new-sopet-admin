import { z } from 'zod';
import {
  getPromotionTypeMeta,
  isPromotionType,
  type PromotionTypeSlug,
} from '@/lib/promotions/metadata';

const promotionTypeEnum = z.enum([
  'percentage',
  'fixed_amount',
  'free_shipping',
  'buy_x_get_y',
  'fixed_shipping_discount',
  'percentage_shipping_discount',
]);

const commonFields = {
  code: z.string().min(1, 'กรุณากรอกรหัสโปรโมชัน').max(50),
  name: z.string().min(1, 'กรุณากรอกชื่อโปรโมชัน'),
  description: z.string().optional(),
  minPurchaseAmount: z.number().min(0, 'ยอดซื้อขั้นต่ำต้องไม่ต่ำกว่า 0').optional(),
  maxDiscountAmount: z.number().min(0, 'ส่วนลดสูงสุดต้องไม่ต่ำกว่า 0').optional(),
  usageLimit: z.number().min(0, 'จำกัดการใช้ทั้งหมดต้องไม่ต่ำกว่า 0').optional(),
  usagePerCustomer: z.number().min(0, 'จำนวนครั้งต่อลูกค้าต้องไม่ต่ำกว่า 0').optional(),
  autoApply: z.boolean().optional(),
  priority: z.number().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  buyQuantity: z.number().min(1, 'กรุณากรอกจำนวนที่ต้องซื้อ').optional(),
  getQuantity: z.number().min(1, 'กรุณากรอกจำนวนที่แถม').optional(),
};

export const promotionFormSchema = z
  .object({
    type: promotionTypeEnum,
    discountValue: z
      .number({ error: 'กรุณากรอกมูลค่าส่วนลด' })
      .min(0, 'มูลค่าส่วนลดต้องไม่ต่ำกว่า 0'),
    ...commonFields,
  })
  .superRefine((data, ctx) => {
    const meta = getPromotionTypeMeta(data.type);
    if (!meta) return;

    if (meta.discountRequired && data.discountValue <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'กรุณากรอกมูลค่าส่วนลด',
      });
    }

    const isPercentage = data.type === 'percentage' || data.type === 'percentage_shipping_discount';
    if (isPercentage && data.discountValue > 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'เปอร์เซ็นต์ส่วนลดต้องไม่เกิน 100',
      });
    }

    if (meta.showBuyGetFields) {
      if (!data.buyQuantity || data.buyQuantity < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['buyQuantity'],
          message: 'กรุณากรอกจำนวนที่ต้องซื้อ',
        });
      }
      if (!data.getQuantity || data.getQuantity < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['getQuantity'],
          message: 'กรุณากรอกจำนวนที่แถม',
        });
      }
    }
  });

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;

export function getPromotionFormDefaults(type: PromotionTypeSlug): PromotionFormValues {
  return {
    code: '',
    name: '',
    description: '',
    type,
    discountValue: type === 'free_shipping' || type === 'buy_x_get_y' ? 0 : 0,
    usagePerCustomer: 1,
    autoApply: false,
    priority: 0,
    buyQuantity: type === 'buy_x_get_y' ? 2 : undefined,
    getQuantity: type === 'buy_x_get_y' ? 1 : undefined,
  };
}

export function buildPromotionConditions(values: PromotionFormValues): string | undefined {
  if (values.type !== 'buy_x_get_y') return undefined;
  return JSON.stringify({
    buyQuantity: values.buyQuantity,
    getQuantity: values.getQuantity,
  });
}

export function getPromotionFormValuesFromPromotion(promotion: {
  code: string;
  name: string;
  description?: string | null;
  type: string;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usagePerCustomer: number;
  autoApply: boolean;
  priority: number;
  conditions?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
}): PromotionFormValues {
  const conditions = parsePromotionConditions(promotion.conditions);
  return {
    code: promotion.code,
    name: promotion.name,
    description: promotion.description ?? '',
    type: promotion.type as PromotionFormValues['type'],
    discountValue: promotion.discountValue,
    minPurchaseAmount: promotion.minPurchaseAmount,
    maxDiscountAmount: promotion.maxDiscountAmount,
    usageLimit: promotion.usageLimit,
    usagePerCustomer: promotion.usagePerCustomer,
    autoApply: promotion.autoApply,
    priority: promotion.priority,
    startsAt: promotion.startsAt?.slice(0, 16) ?? '',
    expiresAt: promotion.expiresAt?.slice(0, 16) ?? '',
    buyQuantity: conditions.buyQuantity,
    getQuantity: conditions.getQuantity,
  };
}

export function parsePromotionConditions(
  conditions?: string | null,
): Pick<PromotionFormValues, 'buyQuantity' | 'getQuantity'> {
  if (!conditions) return {};
  try {
    const parsed = JSON.parse(conditions) as { buyQuantity?: number; getQuantity?: number };
    return {
      buyQuantity: parsed.buyQuantity,
      getQuantity: parsed.getQuantity,
    };
  } catch {
    return {};
  }
}

export function assertPromotionType(value: string): PromotionTypeSlug {
  if (!isPromotionType(value)) {
    throw new Error('invalid promotion type');
  }
  return value;
}
