import type { OmiseRecipientStatus, Product, StoreShippingOption } from '@/types';

export type StoreReadinessItemKey = 'shipping' | 'publishedProduct' | 'payout';

export type StoreReadinessItem = {
  key: StoreReadinessItemKey;
  complete: boolean;
  href: string;
};

export type StoreReadinessChecklist = {
  items: StoreReadinessItem[];
  completedCount: number;
  allComplete: boolean;
};

export function isPayoutSetupComplete(status?: OmiseRecipientStatus | null): boolean {
  return status !== 'not_connected' && status !== 'failed' && status != null;
}

export function buildStoreReadinessChecklist(input: {
  shippingOptions: StoreShippingOption[];
  products: Pick<Product, 'status'>[];
  omiseRecipientStatus?: OmiseRecipientStatus | null;
}): StoreReadinessChecklist {
  const items: StoreReadinessItem[] = [
    {
      key: 'shipping',
      complete: input.shippingOptions.length > 0,
      href: '/vendor/settings?tab=shipping',
    },
    {
      key: 'publishedProduct',
      complete: input.products.some((product) => product.status === 'published'),
      href: '/vendor/products',
    },
    {
      key: 'payout',
      complete: isPayoutSetupComplete(input.omiseRecipientStatus),
      href: '/vendor/settings?tab=payout',
    },
  ];

  const completedCount = items.filter((item) => item.complete).length;

  return {
    items,
    completedCount,
    allComplete: completedCount === items.length,
  };
}

export const STORE_READINESS_LABELS: Record<StoreReadinessItemKey, string> = {
  shipping: 'ตั้งค่าตัวเลือกการจัดส่งอย่างน้อย 1 รายการ',
  publishedProduct: 'เผยแพร่สินค้าอย่างน้อย 1 รายการ',
  payout: 'ตั้งบัญชีรับเงินของร้าน',
};

export const STORE_READINESS_ACTIONS: Record<StoreReadinessItemKey, string> = {
  shipping: 'ไปตั้งค่าการจัดส่ง',
  publishedProduct: 'ไปจัดการสินค้า',
  payout: 'ไปตั้งบัญชีรับเงิน',
};
