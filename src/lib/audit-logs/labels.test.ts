import { describe, expect, it } from 'vitest';
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_RESOURCE_OPTIONS,
  AUDIT_SEVERITY_LABELS,
  formatAuditActor,
  formatAuditMetadata,
  getAuditActionLabel,
  getAuditResourceLabel,
  getAuditSeverityBucket,
  parseComparableAuditPair,
} from '@/lib/audit-logs/labels';

/** New MVP action strings from Design Doc § ACTION_LABELS bind (taxonomy → api_key). */
const NEW_ACTION_LABELS: Record<string, string> = {
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

const NEW_RESOURCE_LABELS: Record<string, string> = {
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

describe('audit log labels', () => {
  it('maps known actions and resources to Thai labels', () => {
    expect(getAuditActionLabel('store.suspended')).toBe('ระงับร้านค้า');
    expect(getAuditResourceLabel('store')).toBe('ร้านค้า');
  });

  it('keeps every previously shipped action and resource key', () => {
    const existingActions = [
      'auth.login',
      'auth.password_reset_sent',
      'vendor.updated',
      'customer.updated',
      'customer.status_changed',
      'store.created',
      'store.updated',
      'store.owner_changed',
      'store.suspended',
      'store.reactivated',
      'store.approved',
      'store.rejected',
      'payout.triggered',
    ] as const;

    for (const action of existingActions) {
      expect(getAuditActionLabel(action)).not.toBe(action);
    }

    for (const resource of ['user', 'vendor', 'customer', 'store', 'payout'] as const) {
      expect(getAuditResourceLabel(resource)).not.toBe(resource);
    }
  });

  it('labels backend-existing auth.email_*, payout.manual_*, and admin.* actions', () => {
    expect(getAuditActionLabel('auth.email_verification_sent')).not.toBe(
      'auth.email_verification_sent',
    );
    expect(getAuditActionLabel('auth.email_verified')).not.toBe('auth.email_verified');
    expect(getAuditActionLabel('payout.manual_settled')).not.toBe('payout.manual_settled');
    expect(getAuditActionLabel('payout.manual_rejected')).not.toBe('payout.manual_rejected');
    expect(getAuditActionLabel('admin.invited')).not.toBe('admin.invited');
    expect(getAuditActionLabel('admin.invitation_revoked')).not.toBe('admin.invitation_revoked');
    expect(getAuditActionLabel('admin.invitation_accepted')).not.toBe('admin.invitation_accepted');
    expect(getAuditActionLabel('admin.status_changed')).not.toBe('admin.status_changed');
    expect(getAuditResourceLabel('admin_invitation')).not.toBe('admin_invitation');
  });

  it('maps new-namespace actions to Design Doc Thai labels (AC-F-024)', () => {
    for (const [action, thai] of Object.entries(NEW_ACTION_LABELS)) {
      expect(getAuditActionLabel(action)).toBe(thai);
      expect(
        AUDIT_ACTION_OPTIONS.some((option) => option.value === action && option.label === thai),
      ).toBe(true);
    }
  });

  it('maps reactivation dual actions distinctly from store.reactivated (D007)', () => {
    expect(getAuditActionLabel('store.reactivated')).toBe('เปิดใช้งานร้านค้า');
    expect(getAuditActionLabel('store.reactivation_approved')).toBe('อนุมัติคำขอเปิดร้านอีกครั้ง');
    expect(getAuditActionLabel('store.reactivation_rejected')).toBe('ปฏิเสธคำขอเปิดร้านอีกครั้ง');
  });

  it('maps new-namespace resources to Design Doc Thai labels', () => {
    for (const [resource, thai] of Object.entries(NEW_RESOURCE_LABELS)) {
      expect(getAuditResourceLabel(resource)).toBe(thai);
      expect(
        AUDIT_RESOURCE_OPTIONS.some((option) => option.value === resource && option.label === thai),
      ).toBe(true);
    }
  });

  it('does not expose settings.ad.reordered in action options (D011)', () => {
    expect(AUDIT_ACTION_OPTIONS.map((option) => option.value)).not.toContain(
      'settings.ad.reordered',
    );
    expect(getAuditActionLabel('settings.ad.reordered')).toBe('settings.ad.reordered');
  });

  it('shows unknown actions as raw string with Info severity ข้อมูล', () => {
    const unknown = 'totally.unknown.action';
    expect(getAuditActionLabel(unknown)).toBe(unknown);
    expect(getAuditSeverityBucket(unknown)).toBe('info');
    expect(AUDIT_SEVERITY_LABELS.info).toBe('ข้อมูล');
    expect(AUDIT_ACTION_OPTIONS.some((option) => option.value === unknown)).toBe(false);
  });

  it('formats actor and metadata for display', () => {
    expect(
      formatAuditActor({
        actorType: 'admin',
        actorLabel: 'admin@sopet.org',
      }),
    ).toBe('ผู้ดูแล: admin@sopet.org');

    expect(formatAuditMetadata(JSON.stringify({ storeName: 'Pet Shop' }))).toContain('Pet Shop');
  });

  it('maps action suffixes to severity buckets', () => {
    expect(getAuditSeverityBucket('store.suspended')).toBe('danger');
    expect(getAuditSeverityBucket('auth.login')).toBe('success');
    expect(getAuditSeverityBucket('store.updated')).toBe('warning');
    expect(getAuditSeverityBucket('auth.password_reset_sent')).toBe('info');
    expect(getAuditSeverityBucket('unknown.custom_event')).toBe('info');
    expect(getAuditSeverityBucket('store.reactivation_approved')).toBe('success');
    expect(getAuditSeverityBucket('store.reactivation_rejected')).toBe('danger');
    expect(getAuditSeverityBucket('taxonomy.category.image_set')).toBe('success');
    expect(getAuditSeverityBucket('settings.banner.reordered')).toBe('warning');
    expect(getAuditSeverityBucket('settings.login_page_images.cleared_desktop')).toBe('danger');
    expect(getAuditSeverityBucket('promotion.toggled')).toBe('warning');
    expect(getAuditSeverityBucket('email.container.default_set')).toBe('success');
  });

  it('parses comparable previous/next or before/after object pairs', () => {
    expect(
      parseComparableAuditPair({
        previous: { status: 'a' },
        next: { status: 'b' },
        note: 'keep',
      }),
    ).toEqual({
      before: { status: 'a' },
      after: { status: 'b' },
      consumedKeys: ['previous', 'next'],
    });

    expect(
      parseComparableAuditPair({
        before: { role: 'viewer' },
        after: { role: 'admin' },
      }),
    ).toEqual({
      before: { role: 'viewer' },
      after: { role: 'admin' },
      consumedKeys: ['before', 'after'],
    });

    expect(parseComparableAuditPair({ previous: { a: 1 }, next: ['not-object'] })).toBeNull();
    expect(parseComparableAuditPair({ before: 'x', after: 'y' })).toBeNull();
    expect(parseComparableAuditPair(null)).toBeNull();
    expect(parseComparableAuditPair({ foo: 1 })).toBeNull();
  });
});
