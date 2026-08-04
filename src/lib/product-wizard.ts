import type { WizardStep } from '@/components/ui/stepper';

/**
 * Shared step labels for the vendor "create product" wizard. The first three
 * steps live on the create page; the last step (SKU/stock/price) happens on
 * the dedicated variants page after the product is created, so both pages
 * render the same step list for a coherent end-to-end flow.
 */
export const PRODUCT_WIZARD_STEPS: WizardStep[] = [
  { label: 'ข้อมูลพื้นฐาน' },
  { label: 'การจัดหมวดหมู่' },
  { label: 'ตัวเลือกสินค้า' },
  { label: 'SKU สต็อก และราคา' },
];
