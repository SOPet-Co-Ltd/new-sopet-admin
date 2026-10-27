'use client';

import { useState } from 'react';
import { HiOutlineCheckCircle } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRejectStoreBankAccount, useVerifyStoreBankAccount } from '@/hooks/useAdminStores';
import { getErrorMessage } from '@/lib/api/errors';
import { formatThaiBankAccountNumber } from '@/lib/banks/formatThaiBankAccountNumber';
import {
  BANK_VERIFICATION_LABELS,
  resolveBankVerificationStatus,
} from '@/lib/payouts/bank-verification';
import { cn } from '@/lib/utils';
import type { AdminStore } from '@/types';

type AdminStoreBankVerificationPanelProps = {
  store: AdminStore;
};

export function AdminStoreBankVerificationPanel({ store }: AdminStoreBankVerificationPanelProps) {
  const verifyMutation = useVerifyStoreBankAccount();
  const rejectMutation = useRejectStoreBankAccount();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const status = resolveBankVerificationStatus(store.bankAccountVerificationStatus);
  const hasBank =
    Boolean(store.bankCode || store.bankName) &&
    Boolean(store.bankAccountNumber) &&
    Boolean(store.bankAccountName);
  const accountDisplay = store.bankAccountNumber
    ? formatThaiBankAccountNumber(store.bankAccountNumber)
    : '—';
  const busy = verifyMutation.isPending || rejectMutation.isPending;
  const trimmedReason = reason.trim();

  async function handleVerify() {
    setFeedback(null);
    try {
      await verifyMutation.mutateAsync(store.id);
      setFeedback({ type: 'success', message: 'ยืนยันบัญชีธนาคารแล้ว — ร้านสามารถขอรับเงินได้' });
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err, 'ยืนยันบัญชีไม่สำเร็จ') });
    }
  }

  async function handleReject() {
    if (!trimmedReason) return;
    setFeedback(null);
    try {
      await rejectMutation.mutateAsync({ storeId: store.id, reason: trimmedReason });
      setRejectOpen(false);
      setReason('');
      setFeedback({ type: 'success', message: 'ปฏิเสธบัญชีธนาคารแล้ว — ร้านต้องแก้ไขและส่งใหม่' });
    } catch (err) {
      setFeedback({ type: 'error', message: getErrorMessage(err, 'ปฏิเสธบัญชีไม่สำเร็จ') });
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display text-lg font-semibold text-balance text-ink">
          บัญชีรับเงิน / การตรวจสอบ
        </h2>
        <p className="text-sm text-muted-foreground">
          ตรวจสอบบัญชีที่ร้านบันทึกไว้ แล้วยืนยันหรือปฏิเสธก่อนอนุญาตให้ร้านขอรับเงิน
        </p>
      </CardHeader>
      <CardBody className="space-y-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">ธนาคาร</dt>
            <dd className="mt-0.5 font-medium text-ink">{store.bankName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">เลขที่บัญชี</dt>
            <dd className="mt-0.5 font-medium tabular-nums text-ink">{accountDisplay}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">ชื่อบัญชี</dt>
            <dd className="mt-0.5 font-medium text-ink">{store.bankAccountName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">สถานะการตรวจสอบ</dt>
            <dd className="mt-0.5 font-medium text-ink">{BANK_VERIFICATION_LABELS[status]}</dd>
          </div>
        </dl>

        {status === 'rejected' && store.bankAccountRejectionReason ? (
          <p className="rounded-lg border border-danger/25 bg-danger-bg px-3 py-2 text-sm text-danger">
            เหตุผลที่ปฏิเสธ: {store.bankAccountRejectionReason}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={!hasBank || status === 'verified' || busy}
            aria-busy={verifyMutation.isPending}
            onClick={() => void handleVerify()}
          >
            {verifyMutation.isPending ? 'กำลังยืนยัน...' : 'ยืนยันบัญชี'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!hasBank || busy}
            onClick={() => setRejectOpen(true)}
          >
            ปฏิเสธบัญชี
          </Button>
          {!hasBank ? (
            <p className="text-sm text-muted-foreground">ร้านยังไม่ได้บันทึกบัญชีธนาคารครบ</p>
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

        <Dialog
          open={rejectOpen}
          onOpenChange={(open) => {
            if (rejectMutation.isPending) return;
            setRejectOpen(open);
            if (!open) setReason('');
          }}
        >
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>ปฏิเสธบัญชีธนาคาร</DialogTitle>
              <DialogDescription>
                ระบุเหตุผล — ร้านจะเห็นข้อความนี้และต้องแก้ไขบัญชีก่อนส่งตรวจสอบใหม่
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="bank-reject-reason" required>
                เหตุผล
              </Label>
              <Textarea
                id="bank-reject-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                className="mt-1.5"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={rejectMutation.isPending}
                onClick={() => {
                  setRejectOpen(false);
                  setReason('');
                }}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                disabled={!trimmedReason || rejectMutation.isPending}
                aria-busy={rejectMutation.isPending}
                onClick={() => void handleReject()}
              >
                {rejectMutation.isPending ? 'กำลังปฏิเสธ...' : 'ยืนยันการปฏิเสธ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardBody>
    </Card>
  );
}
