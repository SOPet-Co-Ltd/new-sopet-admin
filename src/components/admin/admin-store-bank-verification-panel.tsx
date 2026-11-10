'use client';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { formatThaiBankAccountNumber } from '@/lib/banks/formatThaiBankAccountNumber';
import type { AdminStore } from '@/types';

type AdminStoreBankVerificationPanelProps = {
  store: AdminStore;
};

export function AdminStoreBankVerificationPanel({ store }: AdminStoreBankVerificationPanelProps) {
  const hasBank =
    Boolean(store.bankCode || store.bankName) &&
    Boolean(store.bankAccountNumber) &&
    Boolean(store.bankAccountName);
  const accountDisplay = store.bankAccountNumber
    ? formatThaiBankAccountNumber(store.bankAccountNumber)
    : '—';

  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display text-lg font-semibold text-balance text-ink">บัญชีรับเงิน</h2>
        <p className="text-sm text-muted-foreground">
          บัญชีที่ร้านบันทึกไว้สำหรับโอนเงินเมื่อมีคำขอรับเงิน
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
        </dl>

        {!hasBank ? (
          <p className="text-sm text-muted-foreground">ร้านยังไม่ได้บันทึกบัญชีธนาคารครบ</p>
        ) : null}
      </CardBody>
    </Card>
  );
}
