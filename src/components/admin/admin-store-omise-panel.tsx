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
import { useLinkStoreOmiseRecipientAsAdmin } from '@/hooks/useAdminStores';
import { formatThaiBankAccountNumber } from '@/lib/banks/formatThaiBankAccountNumber';
import type { AdminStore, OmiseRecipientStatus } from '@/types';
import { cn } from '@/lib/utils';

const OMISE_STATUS_LABELS: Record<OmiseRecipientStatus, string> = {
  not_connected: 'ยังไม่ได้ยืนยันกับ Omise',
  pending: 'รอ Omise ยืนยัน',
  active: 'Omise พร้อมรับเงิน',
  failed: 'ยืนยัน Omise ไม่สำเร็จ',
};

type AdminStoreOmisePanelProps = {
  store: AdminStore;
};

export function AdminStoreOmisePanel({ store }: AdminStoreOmisePanelProps) {
  const linkMutation = useLinkStoreOmiseRecipientAsAdmin();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const status = (store.omiseRecipientStatus ?? 'not_connected') as OmiseRecipientStatus;
  const hasBank =
    Boolean(store.bankCode || store.bankName) &&
    Boolean(store.bankAccountNumber) &&
    Boolean(store.bankAccountName);
  const accountDisplay = store.bankAccountNumber
    ? formatThaiBankAccountNumber(store.bankAccountNumber)
    : '—';

  async function handleConfirm() {
    setFeedback(null);
    try {
      await linkMutation.mutateAsync(store.id);
      setConfirmOpen(false);
      setFeedback({
        type: 'success',
        message: 'ส่งบัญชีไปยืนยันกับ Omise แล้ว — ตรวจสอบสถานะด้านล่างหลังรีเฟรช',
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
        <h2 className="font-display text-lg font-semibold text-balance text-ink">
          บัญชีรับเงิน / Omise
        </h2>
        <p className="text-sm text-muted-foreground">
          ดูบัญชีที่ร้านบันทึกไว้ และส่งยืนยันกับ Omise ใหม่เมื่อร้านเปลี่ยนบัญชี
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
            <dt className="text-muted-foreground">สถานะ Omise</dt>
            <dd className="mt-0.5 font-medium text-ink">{OMISE_STATUS_LABELS[status] ?? status}</dd>
          </div>
        </dl>

        {status === 'failed' && store.omiseRecipientFailureMessage ? (
          <p className="rounded-lg border border-danger/25 bg-danger-bg px-3 py-2 text-sm text-danger">
            {store.omiseRecipientFailureMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={!hasBank || linkMutation.isPending}
            aria-busy={linkMutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {status === 'active' || status === 'pending' || status === 'failed'
              ? 'ส่งยืนยันกับ Omise อีกครั้ง'
              : 'ส่งยืนยันกับ Omise'}
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
          open={confirmOpen}
          onOpenChange={(open) => {
            if (linkMutation.isPending) return;
            setConfirmOpen(open);
          }}
        >
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>ยืนยันการส่งบัญชีไป Omise</DialogTitle>
              <DialogDescription>
                ระบบจะสร้างหรืออัปเดต Omise recipient จากบัญชีที่ร้านบันทึกไว้
                {store.bankName ? ` (${store.bankName} · ${accountDisplay})` : ''}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={linkMutation.isPending}
                onClick={() => setConfirmOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                disabled={linkMutation.isPending}
                aria-busy={linkMutation.isPending}
                onClick={() => void handleConfirm()}
              >
                {linkMutation.isPending ? 'กำลังส่ง...' : 'ยืนยันและส่ง'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardBody>
    </Card>
  );
}
