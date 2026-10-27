'use client';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
  BANK_VERIFICATION_INFO,
  resolveBankVerificationStatus,
} from '@/lib/payouts/bank-verification';
import { cn } from '@/lib/utils';
import type { StoreDetail } from '@/types';

type VendorBankVerificationPanelProps = {
  store?: StoreDetail;
  loading?: boolean;
};

export function VendorBankVerificationPanel({ store, loading }: VendorBankVerificationPanelProps) {
  const status = resolveBankVerificationStatus(store?.bankAccountVerificationStatus);
  const info = BANK_VERIFICATION_INFO[status];

  return (
    <Card data-tour-id="action-payout-verification">
      <CardHeader className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          ขั้นตอน 2
        </p>
        <h2 className="font-display text-lg font-medium text-ink text-balance">
          ตรวจสอบบัญชีธนาคาร
        </h2>
        <p className="text-sm text-muted-foreground">
          ทีม SOPET ตรวจสอบบัญชีที่คุณบันทึกไว้ก่อนเปิดให้ขอรับเงิน
        </p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="h-20 animate-pulse rounded-xl bg-surface" aria-busy="true" />
        ) : (
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
                {status === 'rejected' && store?.bankAccountRejectionReason ? (
                  <p className="mt-2 text-sm font-medium">
                    เหตุผล: {store.bankAccountRejectionReason}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
