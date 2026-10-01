export const ACTION_GUIDE_STORAGE_KEY = 'sopet-vendor-action-guide';
export const ACTION_GUIDE_QUERY = 'guide';
export const ACTION_GUIDE_CHANGE_EVENT = 'sopet-action-guide-change';

function notifyActionGuideChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ACTION_GUIDE_CHANGE_EVENT));
}

export type ActionGuideId =
  'create-promotion' | 'create-campaign' | 'invite-team' | 'request-store' | 'setup-payout';

export type ActionGuideState = {
  active: boolean;
  id: ActionGuideId | null;
  step: number;
};

export type ActionGuideTip = {
  guideId: ActionGuideId;
  step: number;
  targetId: string;
  title: string;
  body: string;
  primaryLabel: string;
};

const INACTIVE_STATE: ActionGuideState = { active: false, id: null, step: 0 };

const ACTION_GUIDE_IDS = new Set<ActionGuideId>([
  'create-promotion',
  'create-campaign',
  'invite-team',
  'request-store',
  'setup-payout',
]);

function isActionGuideId(id: string): id is ActionGuideId {
  return ACTION_GUIDE_IDS.has(id as ActionGuideId);
}

export function readActionGuideState(): ActionGuideState {
  if (typeof window === 'undefined') return INACTIVE_STATE;
  try {
    const raw = window.sessionStorage.getItem(ACTION_GUIDE_STORAGE_KEY);
    if (!raw) return INACTIVE_STATE;
    const parsed = JSON.parse(raw) as Partial<ActionGuideState>;
    if (parsed.active !== true || typeof parsed.id !== 'string' || !isActionGuideId(parsed.id)) {
      return INACTIVE_STATE;
    }
    const step = typeof parsed.step === 'number' && parsed.step >= 1 ? parsed.step : 1;
    return { active: true, id: parsed.id, step };
  } catch {
    return INACTIVE_STATE;
  }
}

export function clearActionGuide(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACTION_GUIDE_STORAGE_KEY);
  notifyActionGuideChange();
}

export const ACTION_GUIDE_SEEN_PREFIX = 'sopet-vendor-action-guide-seen';

export function actionGuideSeenStorageKey(userId: string, id: ActionGuideId): string {
  return `${ACTION_GUIDE_SEEN_PREFIX}:${userId}:${id}`;
}

export function hasSeenActionGuide(userId: string, id: ActionGuideId): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(actionGuideSeenStorageKey(userId, id)) === '1';
  } catch {
    return false;
  }
}

export function markActionGuideSeen(userId: string, id: ActionGuideId): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(actionGuideSeenStorageKey(userId, id), '1');
  } catch {
    // ignore quota / private mode
  }
}

export function clearActionGuideSeen(userId: string, id: ActionGuideId): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(actionGuideSeenStorageKey(userId, id));
  } catch {
    // ignore
  }
}

export type StartActionGuideOptions = {
  /** Bypass “seen once” (tours hub replay). */
  force?: boolean;
  /** When set, refuse to auto-start if this user already finished/skipped the guide. */
  userId?: string | null;
};

/**
 * Starts a session guide. Returns false when blocked by prior “seen” (unless force).
 */
export function startActionGuide(id: ActionGuideId, options?: StartActionGuideOptions): boolean {
  if (typeof window === 'undefined') return false;
  if (!options?.force && options?.userId && hasSeenActionGuide(options.userId, id)) {
    return false;
  }
  window.sessionStorage.setItem(
    ACTION_GUIDE_STORAGE_KEY,
    JSON.stringify({ active: true, id, step: 1 } satisfies ActionGuideState),
  );
  notifyActionGuideChange();
  return true;
}

export function isActionGuideActive(id: ActionGuideId): boolean {
  const state = readActionGuideState();
  return state.active && state.id === id;
}

export function advanceActionGuide(): void {
  if (typeof window === 'undefined') return;
  const state = readActionGuideState();
  if (!state.active || !state.id) return;
  const last = getActionGuideLastStep(state.id);
  if (state.step >= last) {
    clearActionGuide();
    return;
  }
  window.sessionStorage.setItem(
    ACTION_GUIDE_STORAGE_KEY,
    JSON.stringify({ active: true, id: state.id, step: state.step + 1 }),
  );
  notifyActionGuideChange();
}

export function actionGuideHref(path: string, id: ActionGuideId): string {
  const hasQuery = path.includes('?');
  const sep = hasQuery ? '&' : '?';
  return `${path}${sep}${ACTION_GUIDE_QUERY}=${id}`;
}

export const ACTION_GUIDE_TIPS: ActionGuideTip[] = [
  {
    guideId: 'create-promotion',
    step: 1,
    targetId: 'action-promo-type',
    title: 'เลือกประเภทโปรโมชัน',
    body: 'เลือกประเภทส่วนลดที่ต้องการ เช่น เปอร์เซ็นต์ จำนวนเงิน หรือส่งฟรี แล้วเปิดฟอร์มสร้าง',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'create-promotion',
    step: 2,
    targetId: 'action-promo-basics',
    title: 'ใส่ชื่อและโค้ด',
    body: 'ตั้งชื่อที่ทีมจำง่าย และโค้ดที่ลูกค้าใช้ตอนชำระเงิน (ถ้าประเภทนั้นใช้โค้ด)',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'create-promotion',
    step: 3,
    targetId: 'action-promo-rules',
    title: 'กำหนดส่วนลด',
    body: 'กรอกมูลค่าส่วนลดและเงื่อนไขขั้นต่ำตามประเภทที่เลือก',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'create-promotion',
    step: 4,
    targetId: 'action-promo-schedule',
    title: 'ตั้งระยะเวลาและลิมิต',
    body: 'กำหนดวันเริ่ม–สิ้นสุด และจำกัดจำนวนครั้งใช้ได้ถ้าต้องการ',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'create-promotion',
    step: 5,
    targetId: 'action-promo-submit',
    title: 'บันทึกโปรโมชัน',
    body: 'ตรวจข้อมูลแล้วกดสร้างโปรโมชัน — คุณแก้ไขหรือปิดใช้งานได้ภายหลังจากรายการ',
    primaryLabel: 'เสร็จสิ้น',
  },
  {
    guideId: 'create-campaign',
    step: 1,
    targetId: 'action-campaign-basics',
    title: 'ตั้งชื่อแคมเปญ',
    body: 'ใส่ชื่อแคมเปญที่ทีมเข้าใจ — ใช้แยกแยะโปรลดราคาบนหน้าร้าน',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'create-campaign',
    step: 2,
    targetId: 'action-campaign-items',
    title: 'เลือกสินค้าและ % ลด',
    body: 'เพิ่มสินค้าในแคมเปญแล้วใส่เปอร์เซ็นต์ลด — ราคาหลังลดคือราคาที่ลูกค้าชำระ',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'create-campaign',
    step: 3,
    targetId: 'action-campaign-schedule',
    title: 'กำหนดระยะเวลา',
    body: 'ตั้งวันเริ่มและวันสิ้นสุดของแคมเปญ (เว้นว่างได้ถ้าต้องการเปิดตลอด)',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'create-campaign',
    step: 4,
    targetId: 'action-campaign-submit',
    title: 'บันทึกแคมเปญ',
    body: 'กดบันทึกเมื่อพร้อม — เปิด/ปิดแคมเปญได้จากหน้ารายการภายหลัง',
    primaryLabel: 'เสร็จสิ้น',
  },
  {
    guideId: 'invite-team',
    step: 1,
    targetId: 'action-team-email',
    title: 'ใส่อีเมลสมาชิก',
    body: 'ใช้อีเมลที่ผู้รับเข้าสู่ระบบพอร์ทัลผู้ขายได้',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'invite-team',
    step: 2,
    targetId: 'action-team-role',
    title: 'เลือกบทบาท',
    body: 'ผู้จัดการช่วยดูแลร้านได้กว้างกว่าพนักงาน — เลือกตามหน้าที่ที่มอบหมาย',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'invite-team',
    step: 3,
    targetId: 'action-team-submit',
    title: 'ส่งคำเชิญ',
    body: 'กดส่งคำเชิญ — ผู้รับต้องตอบรับก่อนจึงจะเข้าร่วมทีม',
    primaryLabel: 'เสร็จสิ้น',
  },
  {
    guideId: 'request-store',
    step: 1,
    targetId: 'action-store-name',
    title: 'ใส่ชื่อร้าน',
    body: 'ชื่อร้านเป็นข้อมูลจำเป็น — ใช้แสดงบนแพลตฟอร์มหลังอนุมัติ',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'request-store',
    step: 2,
    targetId: 'action-store-contact',
    title: 'ข้อมูลติดต่อ (ไม่บังคับ)',
    body: 'เบอร์ อีเมล ที่อยู่ หรือโลโก้ช่วยให้ทีมอนุมัติและติดต่อได้เร็วขึ้น',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'request-store',
    step: 3,
    targetId: 'action-store-submit',
    title: 'ส่งคำขอ',
    body: 'กดส่งคำขอเปิดร้าน — ติดตามสถานะได้ที่คำเชิญ / คำขอ',
    primaryLabel: 'เสร็จสิ้น',
  },
  {
    guideId: 'setup-payout',
    step: 1,
    targetId: 'action-payout-bank',
    title: 'กรอกบัญชีธนาคาร',
    body: 'เลือกธนาคาร ชื่อบัญชี และเลขบัญชีตามหน้าสมุด — บันทึกลงระบบ SOPET ก่อน',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'setup-payout',
    step: 2,
    targetId: 'action-payout-save',
    title: 'บันทึกบัญชี',
    body: 'กดบันทึกบัญชีธนาคาร — ยังไม่ส่งไป Omise จนกว่าจะยืนยันในขั้นถัดไป',
    primaryLabel: 'เข้าใจแล้ว',
  },
  {
    guideId: 'setup-payout',
    step: 3,
    targetId: 'action-payout-omise',
    title: 'เชื่อม Omise',
    body: 'ยืนยันบัญชีกับ Omise เพื่อรับเงินผ่าน PromptPay / บัตร ตามที่ร้านเปิดใช้',
    primaryLabel: 'เสร็จสิ้น',
  },
];

export function getActionGuideTip(
  guideId: ActionGuideId,
  step: number,
): ActionGuideTip | undefined {
  return ACTION_GUIDE_TIPS.find((tip) => tip.guideId === guideId && tip.step === step);
}

export function getActionGuideLastStep(guideId: ActionGuideId): number {
  return Math.max(
    ...ACTION_GUIDE_TIPS.filter((tip) => tip.guideId === guideId).map((tip) => tip.step),
  );
}
