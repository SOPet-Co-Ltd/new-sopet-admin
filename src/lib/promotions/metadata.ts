import type { PromotionType } from '@/types';

export const PROMOTION_TYPES = [
  'percentage',
  'fixed_amount',
  'free_shipping',
  'buy_x_get_y',
  'fixed_shipping_discount',
  'percentage_shipping_discount',
] as const satisfies readonly PromotionType[];

export type PromotionTypeSlug = (typeof PROMOTION_TYPES)[number];

export interface PromotionTypeMeta {
  type: PromotionTypeSlug;
  label: string;
  description: string;
  discountLabel: string;
  discountHint?: string;
  showMaxDiscount: boolean;
  discountRequired: boolean;
  showBuyGetFields: boolean;
}

export const promotionTypeMeta: Record<PromotionTypeSlug, PromotionTypeMeta> = {
  percentage: {
    type: 'percentage',
    label: 'ส่วนลดเปอร์เซ็นต์',
    description: 'ลดราคาสินค้าตามเปอร์เซ็นต์จากยอดซื้อ',
    discountLabel: 'เปอร์เซ็นต์ส่วนลด (%)',
    showMaxDiscount: true,
    discountRequired: true,
    showBuyGetFields: false,
  },
  fixed_amount: {
    type: 'fixed_amount',
    label: 'ส่วนลดคงที่',
    description: 'ลดราคาสินค้าเป็นจำนวนเงินคงที่ (บาท)',
    discountLabel: 'มูลค่าส่วนลด (บาท)',
    showMaxDiscount: false,
    discountRequired: true,
    showBuyGetFields: false,
  },
  free_shipping: {
    type: 'free_shipping',
    label: 'จัดส่งฟรี',
    description: 'ยกเว้นค่าจัดส่งเมื่อครบเงื่อนไขยอดซื้อ',
    discountLabel: 'มูลค่าส่วนลด (ไม่จำเป็น)',
    discountHint: 'ใช้ 0 สำหรับจัดส่งฟรีทั้งหมด',
    showMaxDiscount: false,
    discountRequired: false,
    showBuyGetFields: false,
  },
  buy_x_get_y: {
    type: 'buy_x_get_y',
    label: 'ซื้อ X แถม Y',
    description: 'ลูกค้าซื้อครบจำนวนชิ้น รับสินค้าเพิ่มฟรี',
    discountLabel: 'มูลค่าส่วนลด (ไม่จำเป็น)',
    discountHint: 'ใช้ 0 หากเป็นการแถมสินค้า',
    showMaxDiscount: false,
    discountRequired: false,
    showBuyGetFields: true,
  },
  fixed_shipping_discount: {
    type: 'fixed_shipping_discount',
    label: 'ส่วนลดค่าจัดส่งคงที่',
    description: 'ลดค่าจัดส่งเป็นจำนวนเงินคงที่ (บาท)',
    discountLabel: 'ส่วนลดค่าจัดส่ง (บาท)',
    showMaxDiscount: false,
    discountRequired: true,
    showBuyGetFields: false,
  },
  percentage_shipping_discount: {
    type: 'percentage_shipping_discount',
    label: 'ส่วนลดค่าจัดส่งเปอร์เซ็นต์',
    description: 'ลดค่าจัดส่งตามเปอร์เซ็นต์',
    discountLabel: 'เปอร์เซ็นต์ส่วนลดค่าจัดส่ง (%)',
    showMaxDiscount: true,
    discountRequired: true,
    showBuyGetFields: false,
  },
};

export function isPromotionType(value: string): value is PromotionTypeSlug {
  return PROMOTION_TYPES.includes(value as PromotionTypeSlug);
}

export function getPromotionTypeMeta(type: string): PromotionTypeMeta | undefined {
  if (!isPromotionType(type)) return undefined;
  return promotionTypeMeta[type];
}
