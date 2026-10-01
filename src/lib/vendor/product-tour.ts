export const PRODUCT_TOUR_VERSION = 1;

export const PRODUCT_TOUR_STORAGE_PREFIX = 'sopet-vendor-product-tour';

export type ProductTourPath = 'member' | 'owner';

export type ProductTourStatus = 'completed' | 'skipped';

export type ProductTourPersistedState = {
  status: ProductTourStatus;
  version: number;
};

export type ProductTourRole = 'staff' | 'manager' | 'owner';

export type ProductTourStepId =
  | 'welcome'
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'customers'
  | 'reviews'
  | 'marketing'
  | 'team'
  | 'api'
  | 'payout'
  | 'notifications'
  | 'settings'
  | 'help'
  | 'owner-next';

export type ProductTourStep = {
  id: ProductTourStepId;
  /** Matches `data-tour-id` on the target element. Null = centered card. */
  targetId: string | null;
  title: string;
  body: string;
  /** Roles that see this step. */
  roles: ProductTourRole[];
  /** Owner closing step with readiness CTAs. */
  kind?: 'spotlight' | 'next-actions';
};

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    id: 'welcome',
    targetId: 'active-store',
    title: 'ยินดีต้อนรับสู่พอร์ทัลผู้ขาย',
    body: 'ร้านที่กำลังใช้งานแสดงตรงนี้ — สลับร้านได้เมื่อคุณเป็นสมาชิกหลายร้าน',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'dashboard',
    targetId: 'nav-dashboard',
    title: 'แดชบอร์ด',
    body: 'สรุปงานวันนี้ รายการที่ต้องทำ และภาพรวมยอดขายของร้าน',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'orders',
    targetId: 'nav-orders',
    title: 'คำสั่งซื้อ',
    body: 'คิวงานหลักของร้าน — กรองสถานะ จัดเตรียม และอัปเดตการจัดส่งจากที่นี่',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'products',
    targetId: 'nav-products',
    title: 'สินค้า',
    body: 'สร้าง แก้ไขตัวเลือก (variants) จัดการสต็อก และเผยแพร่สินค้าให้ลูกค้าสั่งได้',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'customers',
    targetId: 'nav-customers',
    title: 'ลูกค้า',
    body: 'ดูลูกค้าที่เคยสั่งซื้อจากร้านและประวัติออเดอร์ที่เกี่ยวข้อง',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'reviews',
    targetId: 'nav-reviews',
    title: 'รีวิว',
    body: 'ดูรีวิวสินค้าและตอบกลับลูกค้าเพื่อสร้างความน่าเชื่อถือ',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'marketing',
    targetId: 'nav-promotions',
    title: 'การตลาด',
    body: 'โปรโมชันคือโค้ดส่วนลดตอนชำระเงิน ส่วนแคมเปญใช้ลดราคาสินค้าบนหน้าร้าน',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'team',
    targetId: 'nav-team',
    title: 'ทีมงาน',
    body: 'เชิญสมาชิกเข้าร้านและกำหนดบทบาท Owner / Manager / Staff ได้เฉพาะเจ้าของร้าน',
    roles: ['owner'],
  },
  {
    id: 'api',
    targetId: 'nav-api',
    title: 'API',
    body: 'สร้างคีย์และดูเอกสาร API สำหรับเชื่อมระบบภายนอกกับร้านของคุณ',
    roles: ['manager', 'owner'],
  },
  {
    id: 'payout',
    targetId: 'nav-payout',
    title: 'รับเงิน',
    body: 'ตั้งบัญชีธนาคารและเชื่อม Omise เพื่อรับเงินจากคำสั่งซื้อ — เฉพาะเจ้าของร้าน',
    roles: ['owner'],
  },
  {
    id: 'notifications',
    targetId: 'nav-notifications',
    title: 'การแจ้งเตือน',
    body: 'ติดตามอีเวนต์สำคัญของร้าน เช่น ออเดอร์ใหม่หรือสถานะที่ต้องดำเนินการ',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'settings',
    targetId: 'nav-settings',
    title: 'ตั้งค่า',
    body: 'แก้โปรไฟล์บัญชี และสำหรับเจ้าของร้านยังตั้งค่าข้อมูลร้าน การจัดส่ง และรับเงินได้ที่นี่',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'help',
    targetId: 'nav-help',
    title: 'คู่มือการใช้งาน',
    body: 'เปิดคู่มือทีละหน้าเมื่อต้องการรายละเอียดเพิ่ม หรือกลับมาเปิดทัวร์นี้อีกครั้งจากเมนูบัญชี',
    roles: ['staff', 'manager', 'owner'],
  },
  {
    id: 'owner-next',
    targetId: null,
    title: 'ควรทำอะไรต่อ',
    body: 'ตั้งค่าร้านให้พร้อมขาย เชิญทีม และเฝ้าดูคิวคำสั่งซื้อ — เลือกลิงก์ด้านล่างหรือจบทัวร์เพื่อไปแดชบอร์ด',
    roles: ['owner'],
    kind: 'next-actions',
  },
];

export function resolveProductTourRole(input: {
  isOwner: boolean;
  isManager: boolean;
}): ProductTourRole {
  if (input.isOwner) return 'owner';
  if (input.isManager) return 'manager';
  return 'staff';
}

export function resolveProductTourPath(role: ProductTourRole): ProductTourPath {
  return role === 'owner' ? 'owner' : 'member';
}

export function getProductTourStepsForRole(role: ProductTourRole): ProductTourStep[] {
  return PRODUCT_TOUR_STEPS.filter((step) => step.roles.includes(role));
}

export function productTourStorageKey(userId: string, path: ProductTourPath): string {
  return `${PRODUCT_TOUR_STORAGE_PREFIX}:${userId}:${path}`;
}

export function readProductTourPersistedState(
  userId: string,
  path: ProductTourPath,
): ProductTourPersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(productTourStorageKey(userId, path));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProductTourPersistedState>;
    if (parsed.status !== 'completed' && parsed.status !== 'skipped') return null;
    if (parsed.version !== PRODUCT_TOUR_VERSION) return null;
    return { status: parsed.status, version: PRODUCT_TOUR_VERSION };
  } catch {
    return null;
  }
}

export function writeProductTourPersistedState(
  userId: string,
  path: ProductTourPath,
  status: ProductTourStatus,
): void {
  if (typeof window === 'undefined') return;
  const state: ProductTourPersistedState = { status, version: PRODUCT_TOUR_VERSION };
  window.localStorage.setItem(productTourStorageKey(userId, path), JSON.stringify(state));
}

export function clearProductTourPersistedState(userId: string, path: ProductTourPath): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(productTourStorageKey(userId, path));
}

export function hasCompletedOrSkippedProductTour(userId: string, path: ProductTourPath): boolean {
  return readProductTourPersistedState(userId, path) != null;
}

export function shouldAutoStartProductTour(input: {
  userId: string | null | undefined;
  hasStores: boolean;
  isSuspended: boolean;
  pathname: string;
  path: ProductTourPath;
}): boolean {
  if (!input.userId) return false;
  if (!input.hasStores) return false;
  if (input.isSuspended) return false;
  if (input.pathname.startsWith('/vendor/onboarding')) return false;
  if (!input.pathname.startsWith('/vendor')) return false;
  return !hasCompletedOrSkippedProductTour(input.userId, input.path);
}

export function findTourTargetElement(targetId: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLElement>(`[data-tour-id="${targetId}"]`);
}
