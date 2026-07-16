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
  discountPlaceholder?: string;
  /** When false, discount is fixed by type (e.g. free shipping = full waive). Default true. */
  showDiscountField?: boolean;
  showMaxDiscount: boolean;
  /** Override max-discount cap label (shipping % vs product %). */
  maxDiscountLabel?: string;
  maxDiscountHint?: string;
  discountRequired: boolean;
  showBuyGetFields: boolean;
  /** Override rules section title (e.g. shipping vs product discount). */
  rulesSectionTitle?: string;
  /** Override rules section description when not BxGy / free shipping. */
  rulesSectionDescription?: string;
  /** Override min-purchase label (e.g. free-shipping threshold clarity). */
  minPurchaseLabel?: string;
  minPurchaseHint?: string;
  minPurchasePlaceholder?: string;
  /** Buy X Get Y quantity labels / helpers (only when showBuyGetFields). */
  buyQuantityLabel?: string;
  getQuantityLabel?: string;
  buyQuantityHint?: string;
  getQuantityHint?: string;
  buyGetRuleHint?: string;
}

export const promotionTypeMeta: Record<PromotionTypeSlug, PromotionTypeMeta> = {
  percentage: {
    type: 'percentage',
    label: 'ส่วนลดเปอร์เซ็นต์',
    description: 'ลดราคาสินค้าเป็นเปอร์เซ็นต์จากยอดซื้อ — ไม่ใช่จำนวนเงินคงที่',
    discountLabel: 'เปอร์เซ็นต์ส่วนลด',
    discountHint: '1–100 เช่น 20 = ลด 20% จากยอดสินค้าเมื่อครบขั้นต่ำ (ถ้ามี)',
    discountPlaceholder: 'เช่น 20',
    showMaxDiscount: true,
    discountRequired: true,
    showBuyGetFields: false,
    minPurchaseLabel: 'ยอดซื้อขั้นต่ำก่อนได้ส่วนลด (฿)',
    minPurchaseHint: 'ยอดสินค้าขั้นต่ำก่อนใช้ส่วนลด เว้นว่างหรือ 0 = ไม่มีขั้นต่ำ',
    minPurchasePlaceholder: 'เช่น 300',
    maxDiscountLabel: 'ส่วนลดสูงสุด (บาท)',
    maxDiscountHint: 'จำกัดส่วนลดเป็นบาทต่อออเดอร์ เว้นว่าง = ไม่จำกัด',
  },
  fixed_amount: {
    type: 'fixed_amount',
    label: 'ส่วนลดคงที่',
    description:
      'ลดเป็นบาทจากยอดสินค้าทั้งออเดอร์ (แพลตฟอร์ม) หรือยอดสินค้าของร้านนี้ (ร้านค้า) — ไม่ใช่เปอร์เซ็นต์ และไม่ลดทีละชิ้น',
    discountLabel: 'ส่วนลดทั้งออเดอร์/ร้าน (฿)',
    discountHint: 'หักเป็นบาทจากยอดที่ใช้ได้ หากส่วนลดสูงกว่ายอด ระบบจะลดเท่าที่ยอด (ไม่ติดลบ)',
    discountPlaceholder: 'เช่น 50',
    showMaxDiscount: false,
    discountRequired: true,
    showBuyGetFields: false,
    rulesSectionDescription:
      'กำหนดจำนวนบาทที่หักจากยอดสินค้าทั้งออเดอร์/ร้าน (ไม่ใช่ต่อชิ้น) และยอดซื้อขั้นต่ำ (ถ้ามี)',
    minPurchaseLabel: 'ยอดซื้อขั้นต่ำก่อนได้ส่วนลด (฿)',
    minPurchaseHint: 'ยอดสินค้าขั้นต่ำก่อนใช้ส่วนลด เว้นว่างหรือ 0 = ไม่มีขั้นต่ำ',
    minPurchasePlaceholder: 'เช่น 300',
  },
  free_shipping: {
    type: 'free_shipping',
    label: 'จัดส่งฟรี',
    description: 'ยกเว้นค่าจัดส่งทั้งจำนวนเมื่อยอดซื้อครบตามที่กำหนด — ไม่ลดราคาสินค้า',
    discountLabel: 'มูลค่าส่วนลด',
    showDiscountField: false,
    showMaxDiscount: false,
    discountRequired: false,
    showBuyGetFields: false,
    minPurchaseLabel: 'ยอดซื้อขั้นต่ำก่อนได้จัดส่งฟรี (฿)',
    minPurchaseHint:
      'ยอดสินค้าขั้นต่ำ — ไม่รวมค่าจัดส่ง เว้นว่างหรือ 0 = จัดส่งฟรีทุกรายการโดยไม่มีขั้นต่ำ',
    minPurchasePlaceholder: 'เช่น 500',
  },
  buy_x_get_y: {
    type: 'buy_x_get_y',
    label: 'ซื้อ X แถม Y',
    description: 'ซื้อครบ X ชิ้นของสินค้าที่เลือก แถมฟรี Y ชิ้นของสินค้าเดียวกัน (คิดเป็นชุด X+Y)',
    discountLabel: 'มูลค่าส่วนลด',
    showDiscountField: false,
    showMaxDiscount: false,
    discountRequired: false,
    showBuyGetFields: true,
    buyQuantityLabel: 'จำนวนที่ต้องซื้อ (ชิ้น)',
    getQuantityLabel: 'จำนวนที่แถมฟรี (ชิ้น)',
    buyQuantityHint: 'เช่น ซื้อ 2 แถม 1 ต้องมี 3 ชิ้นในตะกร้าจึงได้แถม 1',
    getQuantityHint: 'เช่น 1 = แถมฟรี 1 ชิ้นเมื่อครบเงื่อนไขซื้อ',
    buyGetRuleHint:
      'เลือกสินค้าหนึ่งรายการเท่านั้น ทุกตัวเลือกของสินค้านั้นนับรวมจำนวน ชิ้นแถมฟรี = floor(จำนวนในตะกร้า ÷ (X+Y)) × Y และเลือกหน่วยราคาถูกสุด',
    minPurchaseLabel: 'ยอดซื้อขั้นต่ำเพิ่มเติม (บาท)',
    minPurchaseHint: 'เงื่อนไขเงินเพิ่มนอกเหนือจากจำนวนชิ้น — เว้นว่างหรือ 0 = ใช้แค่จำนวนชิ้น',
    minPurchasePlaceholder: '0',
  },
  fixed_shipping_discount: {
    type: 'fixed_shipping_discount',
    label: 'ส่วนลดค่าจัดส่งคงที่',
    description: 'ลดเฉพาะค่าจัดส่งเป็นจำนวนเงินคงที่ — ไม่ลดราคาสินค้า',
    discountLabel: 'ส่วนลดค่าจัดส่ง (฿)',
    discountHint: 'หักจากค่าจัดส่งเท่านั้น หากสูงกว่าค่าจัดส่ง ลูกค้าจะได้จัดส่งฟรี',
    discountPlaceholder: 'เช่น 50',
    showMaxDiscount: false,
    discountRequired: true,
    showBuyGetFields: false,
    minPurchaseLabel: 'ยอดซื้อขั้นต่ำก่อนได้ส่วนลดค่าจัดส่ง (฿)',
    minPurchaseHint: 'ยอดสินค้าขั้นต่ำ — ไม่รวมค่าจัดส่ง เว้นว่างหรือ 0 = ไม่มีขั้นต่ำ',
    minPurchasePlaceholder: 'เช่น 300',
  },
  percentage_shipping_discount: {
    type: 'percentage_shipping_discount',
    label: 'ส่วนลดค่าจัดส่งเปอร์เซ็นต์',
    description: 'ลดค่าจัดส่งตามเปอร์เซ็นต์ของค่าจัดส่ง — ไม่ลดราคาสินค้า',
    rulesSectionTitle: 'เงื่อนไขส่วนลดค่าจัดส่ง',
    rulesSectionDescription: 'ลดเฉพาะค่าจัดส่งตามเปอร์เซ็นต์ — ไม่หักจากราคาสินค้า',
    discountLabel: 'เปอร์เซ็นต์ส่วนลดค่าจัดส่ง',
    discountHint: 'คิดจากค่าจัดส่งเท่านั้น (1–100) ไม่ใช่ราคาสินค้า — 100 = จัดส่งฟรี',
    discountPlaceholder: 'เช่น 50',
    maxDiscountLabel: 'ส่วนลดค่าจัดส่งสูงสุด (฿)',
    maxDiscountHint: 'จำกัดส่วนลดค่าจัดส่งเป็นบาทต่อออเดอร์ เว้นว่าง = ไม่จำกัด',
    showMaxDiscount: true,
    discountRequired: true,
    showBuyGetFields: false,
    minPurchaseLabel: 'ยอดซื้อขั้นต่ำก่อนได้ส่วนลดค่าจัดส่ง (฿)',
    minPurchaseHint: 'ยอดสินค้าขั้นต่ำ — ไม่รวมค่าจัดส่ง เว้นว่างหรือ 0 = ไม่มีขั้นต่ำ',
    minPurchasePlaceholder: 'เช่น 300',
  },
};

export function isPromotionType(value: string): value is PromotionTypeSlug {
  return PROMOTION_TYPES.includes(value as PromotionTypeSlug);
}

/** Platform admin cannot create buy_x_get_y (selector + create route). List/edit of existing still allowed. */
export function isAdminCreatablePromotionType(type: PromotionTypeSlug): boolean {
  return type !== 'buy_x_get_y';
}

export function getPromotionTypeMeta(type: string): PromotionTypeMeta | undefined {
  if (!isPromotionType(type)) return undefined;
  return promotionTypeMeta[type];
}
