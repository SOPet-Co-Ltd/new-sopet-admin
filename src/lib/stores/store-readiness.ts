import type { Product, StoreShippingOption } from '@/types';

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

export type PayoutSetupFields = {
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
};

/** Bank account name, number, and bank name are all present. */
export function isPayoutSetupComplete(fields?: PayoutSetupFields | null): boolean {
  return Boolean(
    fields?.bankName?.trim() &&
    fields?.bankAccountName?.trim() &&
    fields?.bankAccountNumber?.trim(),
  );
}

export function buildStoreReadinessChecklist(input: {
  shippingOptions: StoreShippingOption[];
  products: Pick<Product, 'status'>[];
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
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
      complete: isPayoutSetupComplete({
        bankName: input.bankName,
        bankAccountName: input.bankAccountName,
        bankAccountNumber: input.bankAccountNumber,
      }),
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
