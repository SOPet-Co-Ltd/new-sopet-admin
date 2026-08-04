import type { AdminAuditLog, AuditActorType } from '@/types/audit-logs';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'เข้าสู่ระบบ',
  'auth.password_reset_sent': 'ส่งลิงก์รีเซ็ตรหัสผ่าน',
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
};

const RESOURCE_LABELS: Record<string, string> = {
  user: 'ผู้ใช้',
  vendor: 'ผู้ขาย',
  customer: 'ลูกค้า',
  store: 'ร้านค้า',
  payout: 'การจ่ายเงิน',
};

const ACTOR_LABELS: Record<AuditActorType, string> = {
  admin: 'ผู้ดูแล',
  vendor: 'ผู้ขาย',
  customer: 'ลูกค้า',
  system: 'ระบบ',
};

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
