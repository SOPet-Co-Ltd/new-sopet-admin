export const CREATE_PRODUCT_GUIDE_STORAGE_KEY = 'sopet-vendor-create-product-guide';
export const CREATE_PRODUCT_GUIDE_QUERY = 'guide';
export const CREATE_PRODUCT_GUIDE_QUERY_VALUE = 'create-product';

export type CreateProductGuideStep = 1 | 2 | 3 | 4;

export type CreateProductGuideState = {
  active: boolean;
};

export function readCreateProductGuideState(): CreateProductGuideState {
  if (typeof window === 'undefined') return { active: false };
  try {
    const raw = window.sessionStorage.getItem(CREATE_PRODUCT_GUIDE_STORAGE_KEY);
    if (!raw) return { active: false };
    const parsed = JSON.parse(raw) as Partial<CreateProductGuideState>;
    return { active: parsed.active === true };
  } catch {
    return { active: false };
  }
}

export function startCreateProductGuide(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(
    CREATE_PRODUCT_GUIDE_STORAGE_KEY,
    JSON.stringify({ active: true } satisfies CreateProductGuideState),
  );
}

export function clearCreateProductGuide(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CREATE_PRODUCT_GUIDE_STORAGE_KEY);
}

export function isCreateProductGuideActive(): boolean {
  return readCreateProductGuideState().active;
}

export function createProductGuideHref(): string {
  return `/vendor/products/new?${CREATE_PRODUCT_GUIDE_QUERY}=${CREATE_PRODUCT_GUIDE_QUERY_VALUE}`;
}

export type CreateProductGuideTip = {
  step: CreateProductGuideStep;
  targetId: string;
  title: string;
  body: string;
  primaryLabel: string;
};

export const CREATE_PRODUCT_GUIDE_TIPS: CreateProductGuideTip[] = [
  {
    step: 1,
    targetId: 'create-product-name',
    title: 'ใส่ชื่อสินค้า',
    body: 'เริ่มจากชื่อที่ลูกค้าเข้าใจง่าย — กรอกชื่อแล้วกด “ถัดไป” เพื่อไปขั้นการจัดหมวดหมู่',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    step: 2,
    targetId: 'create-product-taxonomy',
    title: 'จัดหมวดหมู่สินค้า',
    body: 'เลือกหมวดหมู่ ประเภทสัตว์ แบรนด์ หรือแท็กได้ตามต้องการ (ข้ามได้) แล้วกด “ถัดไป”',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    step: 3,
    targetId: 'create-product-options',
    title: 'กำหนดตัวเลือกสินค้า',
    body: 'เพิ่มกลุ่มตัวเลือก เช่น สีหรือไซส์ อย่างน้อย 1 ชุด แล้วกด “สร้างสินค้าและไปกำหนดตัวเลือก”',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    step: 4,
    targetId: 'create-product-variants',
    title: 'ตั้ง SKU สต็อก และราคา',
    body: 'นี่คือขั้นสุดท้าย — กรอกราคาและสต็อกแต่ละรายการ แล้วบันทึกเพื่อให้สินค้าพร้อมขาย',
    primaryLabel: 'เสร็จสิ้น',
  },
];

export function getCreateProductGuideTip(
  step: CreateProductGuideStep,
): CreateProductGuideTip | undefined {
  return CREATE_PRODUCT_GUIDE_TIPS.find((tip) => tip.step === step);
}
