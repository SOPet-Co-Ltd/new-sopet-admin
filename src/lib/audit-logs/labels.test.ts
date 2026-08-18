import { describe, expect, it } from 'vitest';
import {
  AUDIT_ACTION_OPTIONS,
  formatAuditActor,
  formatAuditMetadata,
  getAuditActionLabel,
  getAuditResourceLabel,
  getAuditSeverityBucket,
  parseComparableAuditPair,
} from '@/lib/audit-logs/labels';

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

  it('does not expose settings.ad.reordered in action options (D011)', () => {
    expect(AUDIT_ACTION_OPTIONS.some((option) => option.value === 'settings.ad.reordered')).toBe(
      false,
    );
    expect(getAuditActionLabel('settings.ad.reordered')).toBe('settings.ad.reordered');
  });

  it('does not add new-namespace taxonomy/promo maps in this phase', () => {
    expect(getAuditActionLabel('taxonomy.category.created')).toBe('taxonomy.category.created');
    expect(getAuditActionLabel('promotion.created')).toBe('promotion.created');
    expect(getAuditResourceLabel('api_key')).toBe('api_key');
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
