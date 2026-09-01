import type { AdminAuditLog, AuditActorType } from '@/types/audit-logs';

export type AuditSeverityBucket = 'success' | 'warning' | 'danger' | 'info';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'เข้าสู่ระบบ',
  'auth.password_reset_sent': 'ส่งลิงก์รีเซ็ตรหัสผ่าน',
  'auth.email_verification_sent': 'ส่งอีเมลยืนยัน',
  'auth.email_verified': 'ยืนยันอีเมลแล้ว',
  'vendor.updated': 'แก้ไขผู้ขาย',
  'customer.updated': 'แก้ไขลูกค้า',
  'customer.status_changed': 'เปลี่ยนสถานะลูกค้า',
  'store.created': 'สร้างร้านค้า',
  'store.updated': 'แก้ไขร้านค้า',
  'store.owner_changed': 'เปลี่ยนเจ้าของร้าน',
  'store.suspended': 'ระงับร้านค้า',
  'store.reactivated': 'เปิดใช้งานร้านค้า',
  'store.approved': 'อนุมัติร้านค้า',
  'store.rejected': 'ปฏิเสธร้านค้า',
  'payout.triggered': 'สั่งจ่ายเงิน',
  'payout.manual_settled': 'ชำระเงินด้วยตนเอง',
  'payout.manual_rejected': 'ปฏิเสธการจ่ายเงินด้วยตนเอง',
  'admin.invited': 'เชิญผู้ดูแล',
  'admin.invitation_revoked': 'เพิกถอนคำเชิญผู้ดูแล',
  'admin.invitation_accepted': 'ยอมรับคำเชิญผู้ดูแล',
  'admin.status_changed': 'เปลี่ยนสถานะผู้ดูแล',
  'taxonomy.category.created': 'สร้างหมวดหมู่',
  'taxonomy.category.updated': 'แก้ไขหมวดหมู่',
  'taxonomy.category.deleted': 'ลบหมวดหมู่',
  'taxonomy.category.approved': 'อนุมัติหมวดหมู่',
  'taxonomy.category.rejected': 'ปฏิเสธหมวดหมู่',
  'taxonomy.category.image_set': 'ตั้งรูปหมวดหมู่',
  'taxonomy.tag.created': 'สร้างแท็ก',
  'taxonomy.tag.updated': 'แก้ไขแท็ก',
  'taxonomy.tag.deleted': 'ลบแท็ก',
  'taxonomy.tag.approved': 'อนุมัติแท็ก',
  'taxonomy.tag.rejected': 'ปฏิเสธแท็ก',
  'taxonomy.pet_type.created': 'สร้างประเภทสัตว์',
  'taxonomy.pet_type.updated': 'แก้ไขประเภทสัตว์',
  'taxonomy.pet_type.deleted': 'ลบประเภทสัตว์',
  'taxonomy.pet_type.approved': 'อนุมัติประเภทสัตว์',
  'taxonomy.pet_type.rejected': 'ปฏิเสธประเภทสัตว์',
  'taxonomy.pet_type.image_set': 'ตั้งรูปประเภทสัตว์',
  'taxonomy.brand.created': 'สร้างแบรนด์',
  'taxonomy.brand.updated': 'แก้ไขแบรนด์',
  'taxonomy.brand.deleted': 'ลบแบรนด์',
  'taxonomy.brand.approved': 'อนุมัติแบรนด์',
  'taxonomy.brand.rejected': 'ปฏิเสธแบรนด์',
  'promotion.created': 'สร้างโปรโมชัน',
  'promotion.updated': 'แก้ไขโปรโมชัน',
  'promotion.deleted': 'ลบโปรโมชัน',
  'promotion.toggled': 'สลับสถานะโปรโมชัน',
  'settings.banner.created': 'สร้างแบนเนอร์',
  'settings.banner.updated': 'แก้ไขแบนเนอร์',
  'settings.banner.deleted': 'ลบแบนเนอร์',
  'settings.banner.reordered': 'จัดลำดับแบนเนอร์',
  'settings.sponsor.created': 'สร้างสปอนเซอร์',
  'settings.sponsor.updated': 'แก้ไขสปอนเซอร์',
  'settings.sponsor.deleted': 'ลบสปอนเซอร์',
  'settings.sponsor.reordered': 'จัดลำดับสปอนเซอร์',
  'settings.ad.created': 'สร้างโฆษณา',
  'settings.ad.updated': 'แก้ไขโฆษณา',
  'settings.ad.deleted': 'ลบโฆษณา',
  'settings.login_page_images.updated': 'อัปเดตรูปหน้าเข้าสู่ระบบ',
  'settings.login_page_images.cleared_desktop': 'ลบรูปเดสก์ท็อปหน้าเข้าสู่ระบบ',
  'settings.login_page_images.cleared_mobile': 'ลบรูปมือถือหน้าเข้าสู่ระบบ',
  'settings.bank_transfer.updated': 'อัปเดตการโอนผ่านธนาคาร',
  'search.ranking_weights.updated': 'อัปเดตน้ำหนักการจัดอันดับ',
  'search.synonym.created': 'สร้างคำพ้องความหมาย',
  'search.synonym.updated': 'แก้ไขคำพ้องความหมาย',
  'search.synonym.deleted': 'ลบคำพ้องความหมาย',
  'email.container.created': 'สร้างคอนเทนเนอร์อีเมล',
  'email.container.updated': 'แก้ไขคอนเทนเนอร์อีเมล',
  'email.container.default_set': 'ตั้งคอนเทนเนอร์อีเมลเริ่มต้น',
  'email.content_template.updated': 'อัปเดตเทมเพลตเนื้อหาอีเมล',
  'review.approved': 'อนุมัติรีวิวนำเข้า',
  'review.rejected': 'ปฏิเสธรีวิวนำเข้า',
  'shipping_provider.created': 'สร้างผู้ให้บริการจัดส่ง',
  'shipping_provider.updated': 'แก้ไขผู้ให้บริการจัดส่ง',
  'shipping_provider.deleted': 'ลบผู้ให้บริการจัดส่ง',
  'store.reactivation_approved': 'อนุมัติคำขอเปิดร้านอีกครั้ง',
  'store.reactivation_rejected': 'ปฏิเสธคำขอเปิดร้านอีกครั้ง',
  'api_key.created': 'สร้างคีย์ API',
  'api_key.revoked': 'เพิกถอนคีย์ API',
};

const RESOURCE_LABELS: Record<string, string> = {
  user: 'ผู้ใช้',
  vendor: 'ผู้ขาย',
  customer: 'ลูกค้า',
  store: 'ร้านค้า',
  payout: 'การจ่ายเงิน',
  admin_invitation: 'คำเชิญผู้ดูแล',
  taxonomy: 'หมวดหมู่และแท็ก',
  promotion: 'โปรโมชัน',
  settings: 'ตั้งค่าแพลตฟอร์ม',
  search: 'การค้นหา',
  email: 'อีเมล',
  review: 'รีวิว',
  shipping_provider: 'ผู้ให้บริการจัดส่ง',
  reactivation_request: 'คำขอเปิดร้านอีกครั้ง',
  api_key: 'คีย์ API',
};

const ACTOR_LABELS: Record<AuditActorType, string> = {
  admin: 'ผู้ดูแล',
  vendor: 'ผู้ขาย',
  customer: 'ลูกค้า',
  system: 'ระบบ',
};

const DANGER_SUFFIXES = new Set([
  'rejected',
  'deleted',
  'revoked',
  'suspended',
  'cleared_desktop',
  'cleared_mobile',
  'reactivation_rejected',
]);

const SUCCESS_SUFFIXES = new Set([
  'created',
  'approved',
  'login',
  'reactivated',
  'reactivation_approved',
  'triggered',
  'image_set',
  'default_set',
]);

const WARNING_SUFFIXES = new Set([
  'updated',
  'toggled',
  'reordered',
  'owner_changed',
  'status_changed',
]);

const INFO_SUFFIXES = new Set(['password_reset_sent']);

export const AUDIT_SEVERITY_LABELS: Record<AuditSeverityBucket, string> = {
  success: 'สำเร็จ',
  warning: 'เปลี่ยนแปลง',
  danger: 'เสี่ยง',
  info: 'ข้อมูล',
};

function actionSuffix(action: string): string {
  const dot = action.lastIndexOf('.');
  return dot === -1 ? action : action.slice(dot + 1);
}

export function getAuditSeverityBucket(action: string): AuditSeverityBucket {
  const suffix = actionSuffix(action);
  if (DANGER_SUFFIXES.has(suffix)) return 'danger';
  if (SUCCESS_SUFFIXES.has(suffix)) return 'success';
  if (WARNING_SUFFIXES.has(suffix)) return 'warning';
  if (INFO_SUFFIXES.has(suffix)) return 'info';
  return 'info';
}

export function parseComparableAuditPair(metadata: unknown): {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  consumedKeys: string[];
} | null {
  if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const record = metadata as Record<string, unknown>;

  const tryPair = (
    beforeKey: string,
    afterKey: string,
  ): {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    consumedKeys: string[];
  } | null => {
    const before = record[beforeKey];
    const after = record[afterKey];
    if (
      before !== null &&
      typeof before === 'object' &&
      !Array.isArray(before) &&
      after !== null &&
      typeof after === 'object' &&
      !Array.isArray(after)
    ) {
      return {
        before: before as Record<string, unknown>,
        after: after as Record<string, unknown>,
        consumedKeys: [beforeKey, afterKey],
      };
    }
    return null;
  };

  return tryPair('previous', 'next') ?? tryPair('before', 'after');
}

export function getAuditActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function getAuditResourceLabel(resourceType: string): string {
  return RESOURCE_LABELS[resourceType] ?? resourceType;
}

export function getAuditActorTypeLabel(actorType: AuditActorType): string {
  return ACTOR_LABELS[actorType] ?? actorType;
}

export function formatAuditActor(log: Pick<AdminAuditLog, 'actorType' | 'actorLabel'>): string {
  const typeLabel = getAuditActorTypeLabel(log.actorType);
  if (log.actorLabel) {
    return `${typeLabel}: ${log.actorLabel}`;
  }
  return typeLabel;
}

export function formatAuditMetadata(metadata?: string | null): string {
  if (!metadata) return '—';
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    const parts = Object.entries(parsed)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .slice(0, 4)
      .map(
        ([key, value]) =>
          `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`,
      );
    return parts.length > 0 ? parts.join(' · ') : '—';
  } catch {
    return metadata;
  }
}

export const AUDIT_ACTION_OPTIONS = Object.entries(ACTION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const AUDIT_RESOURCE_OPTIONS = Object.entries(RESOURCE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
