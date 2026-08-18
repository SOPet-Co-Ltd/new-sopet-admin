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
};

const RESOURCE_LABELS: Record<string, string> = {
  user: 'ผู้ใช้',
  vendor: 'ผู้ขาย',
  customer: 'ลูกค้า',
  store: 'ร้านค้า',
  payout: 'การจ่ายเงิน',
  admin_invitation: 'คำเชิญผู้ดูแล',
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
