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
  newCustomerOnly: z.boolean().optional(),
  newCustomerMaxAccountAgeDays: z.number().optional(),
  productId: z.string().optional(),
  /** Form-local display only — never emitted into conditions JSON. */
  productName: z.string().optional(),
};

export const promotionFormSchema = z
  .object({
    type: promotionTypeEnum,
    discountValue: z
      .number({ error: 'กรุณากรอกมูลค่าส่วนลด' })
      .min(0, 'มูลค่าส่วนลดต้องไม่ต่ำกว่า 0')
      .optional(),
    ...commonFields,
  })
  .superRefine((data, ctx) => {
    const meta = getPromotionTypeMeta(data.type);
    if (!meta) return;

    if (meta.discountRequired && (data.discountValue === undefined || data.discountValue <= 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message:
          data.type === 'fixed_amount'
            ? 'กรุณากรอกส่วนลดเป็นบาท (มากกว่า 0)'
            : data.type === 'fixed_shipping_discount'
              ? 'กรุณากรอกส่วนลดค่าจัดส่งเป็นบาท (มากกว่า 0)'
              : data.type === 'percentage_shipping_discount'
                ? 'กรุณากรอกเปอร์เซ็นต์ส่วนลดค่าจัดส่ง (1–100)'
                : data.type === 'percentage'
                  ? 'กรุณากรอกเปอร์เซ็นต์ส่วนลดสินค้า (1–100)'
                  : 'กรุณากรอกมูลค่าส่วนลด',
      });
    }

    const isPercentage = data.type === 'percentage' || data.type === 'percentage_shipping_discount';
    if (isPercentage && data.discountValue !== undefined && data.discountValue > 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message:
          data.type === 'percentage_shipping_discount'
            ? 'เปอร์เซ็นต์ส่วนลดค่าจัดส่งต้องไม่เกิน 100'
            : 'เปอร์เซ็นต์ส่วนลดต้องไม่เกิน 100',
      });
    }

    if (meta.showBuyGetFields) {
      if (!data.buyQuantity || data.buyQuantity < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['buyQuantity'],
          message: 'กรุณากรอกจำนวนชิ้นที่ลูกค้าต้องซื้อ (อย่างน้อย 1)',
        });
      } else if (!Number.isInteger(data.buyQuantity)) {
        ctx.addIssue({
          code: 'custom',
          path: ['buyQuantity'],
          message: 'จำนวนที่ต้องซื้อต้องเป็นจำนวนเต็ม',
        });
      } else if (data.buyQuantity > 99) {
        ctx.addIssue({
          code: 'custom',
          path: ['buyQuantity'],
          message: 'จำนวนที่ต้องซื้อต้องไม่เกิน 99 ชิ้น',
        });
      }

      if (!data.getQuantity || data.getQuantity < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['getQuantity'],
          message: 'กรุณากรอกจำนวนชิ้นที่แถมฟรี (อย่างน้อย 1)',
        });
      } else if (!Number.isInteger(data.getQuantity)) {
        ctx.addIssue({
          code: 'custom',
          path: ['getQuantity'],
          message: 'จำนวนที่แถมต้องเป็นจำนวนเต็ม',
        });
      } else if (data.getQuantity > 99) {
        ctx.addIssue({
          code: 'custom',
          path: ['getQuantity'],
          message: 'จำนวนที่แถมต้องไม่เกิน 99 ชิ้น',
        });
      }

      if (!data.productId?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['productId'],
          message: 'กรุณาเลือกสินค้าสำหรับโปรซื้อแถม',
        });
      }
    }

    if (data.newCustomerOnly) {
      const nDays = data.newCustomerMaxAccountAgeDays;
      if (nDays === undefined || nDays === null || nDays <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['newCustomerMaxAccountAgeDays'],
          message: 'กรุณาระบุจำนวนวันเป็นจำนวนเต็มที่มากกว่า 0',
        });
      } else if (!Number.isInteger(nDays)) {
        ctx.addIssue({
          code: 'custom',
          path: ['newCustomerMaxAccountAgeDays'],
          message: 'ต้องเป็นจำนวนเต็ม',
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
    // Empty for required amount/percent types so vendors must enter a value; free shipping / BxGy seed 0.
    discountValue:
      type === 'free_shipping' || type === 'buy_x_get_y'
        ? 0
        : type === 'fixed_amount' ||
            type === 'fixed_shipping_discount' ||
            type === 'percentage' ||
            type === 'percentage_shipping_discount'
          ? (undefined as unknown as number)
          : 0,
    usagePerCustomer: 1,
    autoApply: false,
    priority: 0,
    buyQuantity: type === 'buy_x_get_y' ? 2 : undefined,
    getQuantity: type === 'buy_x_get_y' ? 1 : undefined,
    newCustomerOnly: false,
    newCustomerMaxAccountAgeDays: undefined,
    productId: undefined,
    productName: undefined,
  };
}

type ConditionsPayload = {
  newCustomer?: { enabled: true; nDays: number };
  productId?: string;
  buyQuantity?: number;
  getQuantity?: number;
};

export function buildPromotionConditions(values: PromotionFormValues): string | undefined {
  const payload: ConditionsPayload = {};

  if (values.newCustomerOnly && values.newCustomerMaxAccountAgeDays) {
    payload.newCustomer = {
      enabled: true,
      nDays: values.newCustomerMaxAccountAgeDays,
    };
  }

  if (values.type === 'buy_x_get_y') {
    if (values.productId) {
      payload.productId = values.productId;
    }
    payload.buyQuantity = values.buyQuantity;
    payload.getQuantity = values.getQuantity;
  }

  if (Object.keys(payload).length === 0) {
    return undefined;
  }

  return JSON.stringify(payload);
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
    newCustomerOnly: conditions.newCustomerOnly ?? false,
    newCustomerMaxAccountAgeDays: conditions.newCustomerMaxAccountAgeDays,
    productId: conditions.productId,
  };
}

export function parsePromotionConditions(
  conditions?: string | null,
): Pick<
  PromotionFormValues,
  'buyQuantity' | 'getQuantity' | 'productId' | 'newCustomerOnly' | 'newCustomerMaxAccountAgeDays'
> {
  if (!conditions) return {};
  try {
    const parsed = JSON.parse(conditions) as {
      buyQuantity?: number;
      getQuantity?: number;
      productId?: string;
      newCustomer?: { enabled?: boolean; nDays?: number };
    };
    const newCustomerEnabled = parsed.newCustomer?.enabled === true;
    return {
      buyQuantity: parsed.buyQuantity,
      getQuantity: parsed.getQuantity,
      productId: parsed.productId,
      newCustomerOnly: newCustomerEnabled ? true : false,
      newCustomerMaxAccountAgeDays: newCustomerEnabled ? parsed.newCustomer?.nDays : undefined,
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
