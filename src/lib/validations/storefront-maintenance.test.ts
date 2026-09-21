import { describe, expect, it } from 'vitest';
import { storefrontMaintenanceFormSchema } from '@/lib/validations';

describe('storefrontMaintenanceFormSchema', () => {
  it('allows disabled without reason', () => {
    const parsed = storefrontMaintenanceFormSchema.safeParse({
      enabled: false,
      reason: null,
      customMessage: '',
      untilAt: '',
    });
    expect(parsed.success).toBe(true);
  });

  it('requires reason when enabled', () => {
    const parsed = storefrontMaintenanceFormSchema.safeParse({
      enabled: true,
      reason: null,
      customMessage: '',
      untilAt: '',
    });
    expect(parsed.success).toBe(false);
  });

  it('requires customMessage when OTHER', () => {
    const parsed = storefrontMaintenanceFormSchema.safeParse({
      enabled: true,
      reason: 'OTHER',
      customMessage: '  ',
      untilAt: '',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts OTHER with message and future untilAt', () => {
    const parsed = storefrontMaintenanceFormSchema.safeParse({
      enabled: true,
      reason: 'OTHER',
      customMessage: 'ย้ายเซิร์ฟเวอร์',
      untilAt: '2099-01-01T12:00',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects past untilAt', () => {
    const parsed = storefrontMaintenanceFormSchema.safeParse({
      enabled: true,
      reason: 'MAINTENANCE',
      customMessage: '',
      untilAt: '2020-01-01T12:00',
    });
    expect(parsed.success).toBe(false);
  });
});
