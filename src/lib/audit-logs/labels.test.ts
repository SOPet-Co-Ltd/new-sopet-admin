import { describe, expect, it } from 'vitest';
import {
  formatAuditActor,
  formatAuditMetadata,
  getAuditActionLabel,
  getAuditResourceLabel,
} from '@/lib/audit-logs/labels';

describe('audit log labels', () => {
  it('maps known actions and resources to Thai labels', () => {
    expect(getAuditActionLabel('store.suspended')).toBe('ระงับร้านค้า');
    expect(getAuditResourceLabel('store')).toBe('ร้านค้า');
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
});
