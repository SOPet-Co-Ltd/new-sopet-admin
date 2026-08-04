import { describe, expect, it } from 'vitest';
import {
  EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
  formatResendCooldownLabel,
  getResendEmailVerificationButtonLabel,
} from './resend';

describe('email verification resend helpers', () => {
  it('uses a 60 second cooldown duration', () => {
    expect(EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS).toBe(60);
  });

  it('formats Thai countdown label', () => {
    expect(formatResendCooldownLabel(45)).toBe('ส่งอีเมลอีกครั้งใน 45 วินาที');
  });

  it('returns pending, cooldown, and default labels', () => {
    expect(
      getResendEmailVerificationButtonLabel({
        isPending: true,
        isCooldown: false,
        cooldownSeconds: 0,
      }),
    ).toBe('กำลังส่ง...');

    expect(
      getResendEmailVerificationButtonLabel({
        isPending: false,
        isCooldown: true,
        cooldownSeconds: 12,
      }),
    ).toBe('ส่งอีเมลอีกครั้งใน 12 วินาที');

    expect(
      getResendEmailVerificationButtonLabel({
        isPending: false,
        isCooldown: false,
        cooldownSeconds: 0,
      }),
    ).toBe('ส่งอีเมลยืนยันอีกครั้ง');
  });
});
