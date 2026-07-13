/** Client-side cooldown after a successful resend (no dedicated backend rate limit on resend). */
export const EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

export function formatResendCooldownLabel(seconds: number): string {
  return `ส่งอีเมลอีกครั้งใน ${seconds} วินาที`;
}

export function getResendEmailVerificationButtonLabel(options: {
  isPending: boolean;
  isCooldown: boolean;
  cooldownSeconds: number;
}): string {
  if (options.isPending) {
    return 'กำลังส่ง...';
  }

  if (options.isCooldown) {
    return formatResendCooldownLabel(options.cooldownSeconds);
  }

  return 'ส่งอีเมลยืนยันอีกครั้ง';
}
