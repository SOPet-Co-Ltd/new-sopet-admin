/**
 * Admin/Vendor Playwright fixtures for Promotion Universal Conditions create journey.
 * ADR-0007 Decision 4 (A): platform Products query — storeId optional (not required);
 * vendor catalog remains store-scoped (VendorProducts / storeId on Products when used).
 */

export const PROMOTION_UC_VENDOR_STORE_ID = 'store-promo-uc-vendor-1';
export const PROMOTION_UC_PLATFORM_PRODUCT_ID = 'prod-promo-uc-platform-1';
export const PROMOTION_UC_VENDOR_PRODUCT_ID = 'prod-promo-uc-vendor-1';
export const NEW_CUSTOMER_SEED_N_DAYS = 30;

export type PromotionConditionsPayload = {
  newCustomer?: { enabled: true; nDays: number };
  productId?: string;
  buyQuantity?: number;
  getQuantity?: number;
};

export function buildAdminNewCustomerConditions(
  nDays: number = NEW_CUSTOMER_SEED_N_DAYS,
): Pick<PromotionConditionsPayload, 'newCustomer'> {
  return { newCustomer: { enabled: true, nDays } };
}

export function buildAdminBxGyConditions(
  productId: string = PROMOTION_UC_PLATFORM_PRODUCT_ID,
): Required<Pick<PromotionConditionsPayload, 'productId' | 'buyQuantity' | 'getQuantity'>> {
  return {
    productId,
    buyQuantity: 2,
    getQuantity: 1,
  };
}

/** Published product returned by platform PRODUCTS_QUERY (no required storeId). */
export const platformPublishedProduct = {
  id: PROMOTION_UC_PLATFORM_PRODUCT_ID,
  storeId: 'store-any-catalog-1',
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food-5kg-uc',
  description: 'Fixture product for platform BxGy picker',
  basePrice: 890,
  warning: null as string | null,
  expiryDate: null as string | null,
  thumbnailUrl: 'https://example.com/dog-food-uc.jpg',
  status: 'published',
  category: 'dog-food',
  categoryId: 'cat-1',
  petTypeId: 'pet-dog',
  brandId: null as string | null,
  tags: ['dog'],
  tagIds: [],
  images: [] as unknown[],
  variants: [] as unknown[],
};

/** Published product for vendor store-scoped catalog. */
export const vendorStoreScopedProduct = {
  ...platformPublishedProduct,
  id: PROMOTION_UC_VENDOR_PRODUCT_ID,
  storeId: PROMOTION_UC_VENDOR_STORE_ID,
  name: 'Vendor Store Dog Treats',
  slug: 'vendor-dog-treats-uc',
};

export const productsPagination = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

/**
 * Expected successful createPromotion conditions (golden shape for capture asserts).
 * UI Spec chips: ลูกค้าใหม่ ≤ 30 วัน · ซื้อ 2 แถม 1
 */
export const expectedCreatePromotionConditions: PromotionConditionsPayload = {
  ...buildAdminNewCustomerConditions(),
  ...buildAdminBxGyConditions(PROMOTION_UC_PLATFORM_PRODUCT_ID),
};

export const sampleCreatedPromotion = {
  id: 'promo-uc-created-1',
  storeId: null as string | null,
  code: 'BUY2GET1',
  name: 'ซื้อ 2 แถม 1',
  description: null as string | null,
  type: 'buy_x_get_y',
  scope: 'platform',
  discountValue: 0,
  minPurchaseAmount: null as number | null,
  maxDiscountAmount: null as number | null,
  usageLimit: null as number | null,
  usagePerCustomer: null as number | null,
  usageCount: 0,
  isActive: true,
  autoApply: false,
  priority: 0,
  conditions: JSON.stringify(expectedCreatePromotionConditions),
  startsAt: '2026-07-01T00:00:00.000Z',
  expiresAt: '2027-05-24T00:00:00.000Z',
  createdAt: '2026-07-16T00:00:00.000Z',
};

/** Soft/chip fixture labels for list assertions (UI Spec AC-034). */
export const LIST_CHIP_FIXTURE_LABELS = {
  newCustomer: `ลูกค้าใหม่ ≤ ${NEW_CUSTOMER_SEED_N_DAYS} วัน`,
  bxgy: (x: number, y: number, productLabel: string) => `ซื้อ ${x} แถม ${y} · ${productLabel}`,
} as const;
