'use client';

import { useState } from 'react';
import { HiOutlineCheckCircle } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useLinkStoreOmiseRecipient } from '@/hooks/useStoreSettings';
import type { OmiseRecipientStatus, StoreDetail } from '@/types';
import { cn } from '@/lib/utils';

const OMISE_STATUS_INFO: Record<
  OmiseRecipientStatus,
  { label: string; description: string; className: string; dotClassName: string }
> = {
  not_connected: {
    label: 'ยังไม่ได้ยืนยันกับ Omise',
    description: 'กดส่งยืนยันเพื่อให้ Omise ตรวจสอบบัญชีธนาคารที่บันทึกไว้',
    className: 'border-border bg-surface text-ink',
    dotClassName: 'bg-muted',
  },
  pending: {
    label: 'รอ Omise ยืนยันบัญชี',
    description: 'Omise กำลังตรวจสอบ — เมื่อผ่านแล้วจะขอรับเงิน Omise ได้',
    className: 'border-warning-text/20 bg-warning-bg text-warning-text',
    dotClassName: 'bg-warning-text',
  },
  active: {
    label: 'Omise พร้อมรับเงิน',
    description: 'บัญชีผ่านการยืนยันแล้ว สามารถขอรับเงิน Omise ได้',
    className: 'border-success-text/30 bg-success-bg text-success-text',
    dotClassName: 'bg-success-text',
  },
  failed: {
    label: 'ยืนยัน Omise ไม่สำเร็จ',
    description: 'ตรวจบัญชีแล้วลองส่งยืนยันอีกครั้ง หรือติดต่อทีมสนับสนุน',
    className: 'border-danger/30 bg-danger-bg text-danger',
    dotClassName: 'bg-danger',
  },
};

type VendorOmiseLinkPanelProps = {
  store?: StoreDetail;
  loading?: boolean;
};

export function VendorOmiseLinkPanel({ store, loading }: VendorOmiseLinkPanelProps) {
  const linkMutation = useLinkStoreOmiseRecipient();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const status = (store?.omiseRecipientStatus ?? 'not_connected') as OmiseRecipientStatus;
  const info = OMISE_STATUS_INFO[status] ?? OMISE_STATUS_INFO.not_connected;
  const hasBank =
    Boolean(store?.bankCode) &&
    Boolean(store?.bankAccountNumber) &&
    Boolean(store?.bankAccountName);

  async function handleLink() {
    setFeedback(null);
    try {
      await linkMutation.mutateAsync();
      setFeedback({
        type: 'success',
        message: 'ส่งบัญชีไปยืนยันกับ Omise แล้ว — รอสถานะอัปเดต',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'ส่งยืนยัน Omise ไม่สำเร็จ',
      });
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          ขั้นตอน 2
        </p>
        <h2 className="font-display text-lg font-medium text-ink text-balance">
          ยืนยันบัญชีกับ Omise
        </h2>
        <p className="text-sm text-muted-foreground">
          จำเป็นเฉพาะยอด PromptPay / บัตร — ยอดโอนเข้าบัญชี SOPET (Manual) ไม่ต้องผ่านขั้นตอนนี้
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-surface" aria-busy="true" />
        ) : (
          <>
            <div
              className={cn('rounded-xl border px-4 py-3', info.className)}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', info.dotClassName)}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{info.label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed">{info.description}</p>
                  {status === 'failed' && store?.omiseRecipientFailureMessage ? (
                    <p className="mt-2 text-xs font-medium">{store.omiseRecipientFailureMessage}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => void handleLink()}
                disabled={!hasBank || linkMutation.isPending}
                aria-busy={linkMutation.isPending}
              >
                {linkMutation.isPending
                  ? 'กำลังส่งไป Omise...'
                  : status === 'active'
                    ? 'ส่งยืนยันกับ Omise อีกครั้ง'
                    : status === 'pending' || status === 'failed'
                      ? 'ส่งยืนยันกับ Omise อีกครั้ง'
                      : 'ส่งยืนยันกับ Omise'}
              </Button>
              {!hasBank ? (
                <p className="text-sm text-muted-foreground">บันทึกบัญชีธนาคารในขั้นตอน 1 ก่อน</p>
              ) : status === 'active' ? (
                <p className="text-sm text-muted-foreground">
                  หากเปลี่ยนบัญชีแล้ว ให้ส่งยืนยันอีกครั้งเพื่ออัปเดต Omise
                </p>
              ) : null}
            </div>

            {feedback ? (
              <div
                className={cn(
                  'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
                  feedback.type === 'success'
                    ? 'border-success-text/30 bg-success-bg text-success-text'
                    : 'border-danger/25 bg-danger-bg text-danger',
                )}
                role={feedback.type === 'error' ? 'alert' : 'status'}
              >
                {feedback.type === 'success' ? (
                  <HiOutlineCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                ) : null}
                <p className="font-medium">{feedback.message}</p>
              </div>
            ) : null}
          </>
        )}
      </CardBody>
    </Card>
  );
}
