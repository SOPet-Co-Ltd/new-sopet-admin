'use client';

/**
 * Banner shown while the session requires a password change (INF-006).
 */
export function MustChangePasswordBanner() {
  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning-text"
    >
      <p className="font-medium">ต้องเปลี่ยนรหัสผ่านก่อนใช้งานต่อ</p>
      <p className="mt-1">
        บัญชีนี้ใช้รหัสผ่านชั่วคราวหรือถูกบังคับให้เปลี่ยนรหัสผ่าน
        กรุณาตั้งรหัสผ่านใหม่ด้านล่างก่อนเข้าใช้งานส่วนอื่นของระบบ
      </p>
    </div>
  );
}
