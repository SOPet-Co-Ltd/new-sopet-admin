'use client';

import { HiEnvelope } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { useResendEmailVerification } from '@/hooks/useEmailVerification';
import { getErrorMessage } from '@/lib/api/errors';

export function EmailVerificationNotice({ email }: { email: string }) {
  const resendMutation = useResendEmailVerification();

  return (
    <div
      id="email-verification-banner"
      className="mb-6 rounded-lg border border-warning/40 bg-warning-bg/40 px-4 py-3.5 text-sm text-ink"
      role="status"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <HiEnvelope className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-medium text-ink">ยังไม่ได้ยืนยันอีเมล</p>
            <p className="mt-1 text-muted">
              กรุณายืนยันอีเมล <span className="font-medium text-ink">{email}</span>{' '}
              ก่อนขอเปิดร้านใหม่ ตรวจสอบกล่องจดหมาย (รวมโฟลเดอร์สแปม)
              หรือกดปุ่มด้านล่างเพื่อส่งลิงก์ยืนยันอีกครั้ง
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={resendMutation.isResendDisabled}
          aria-busy={resendMutation.isPending}
          className="shrink-0 self-start border-warning/40 bg-white hover:bg-warning-bg/30"
          onClick={() => resendMutation.mutate()}
        >
          {resendMutation.resendButtonLabel}
        </Button>
      </div>
      {resendMutation.isSuccess ? (
        <p className="mt-2 pl-8 text-xs text-muted">ส่งอีเมลแล้ว — กรุณาตรวจสอบกล่องจดหมาย</p>
      ) : null}
      {resendMutation.error ? (
        <p className="mt-2 pl-8 text-xs text-danger" role="alert">
          {getErrorMessage(resendMutation.error)}
        </p>
      ) : null}
    </div>
  );
}
