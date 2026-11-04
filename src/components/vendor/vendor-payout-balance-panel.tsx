'use client';

import { CommissionBreakdown } from '@/components/payouts/commission-breakdown';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useRequestPayout, useStorePayoutSummary } from '@/hooks/usePayouts';
import { useMyStore } from '@/hooks/useStoreSettings';
import { commissionCopy } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';
import type { PayoutSummary } from '@/types';
import { getErrorMessage } from '@/lib/api/errors';

function AvailableVendorBreakdown({ rail }: { rail: PayoutSummary }) {
  return (
    <CommissionBreakdown
      variant="available"
      audience="vendor"
      productSold={rail.productSold}
      shippingFees={rail.shippingFees}
      commissionAmount={rail.commissionAmount}
      commissionRate={rail.commissionRate}
      netPayable={rail.availableBalance}
      captions={{
        combined: commissionCopy.breakdown.hint.combined,
        shipping: commissionCopy.breakdown.hint.shipping,
        payoutTime: commissionCopy.breakdown.hint.payoutTime,
      }}
    />
  );
}

function BalanceSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-live="polite">
      <div className="h-56 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
      <span className="sr-only">กำลังโหลดยอดเงิน...</span>
    </div>
  );
}

export function VendorPayoutBalancePanel() {
  const { data: summary, isLoading, isError, error, refetch } = useStorePayoutSummary();
  const { data: store } = useMyStore();
  const requestPayout = useRequestPayout();

  const hasBankAccount = Boolean(
    store?.bankName?.trim() && store?.bankAccountName?.trim() && store?.bankAccountNumber?.trim(),
  );
  const minimum = summary?.minimumPayoutAmount ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ขั้นตอน 2
          </p>
          <h2 className="mt-1 font-display text-lg font-medium text-ink">ขอรับเงิน</h2>
        </div>
        <BalanceSkeleton />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <Card>
        <CardBody className="space-y-3 p-6">
          <p className="text-sm font-medium text-ink">โหลดยอด payout ไม่สำเร็จ</p>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(error, 'ลองโหลดใหม่อีกครั้ง')}
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            ลองใหม่
          </Button>
        </CardBody>
      </Card>
    );
  }

  const disabledReason = !hasBankAccount
    ? 'ยังไม่ได้บันทึกบัญชีธนาคาร — กรอกและบันทึกในขั้นตอน 1 ก่อน'
    : !summary.canRequestPayout && summary.pendingPayoutAmount > 0
      ? 'มีคำขอรับเงินที่รอแอดมินโอนและอนุมัติอยู่แล้ว'
      : !summary.canRequestPayout && summary.availableBalance <= 0
        ? 'ยังไม่มียอดที่ขอรับเงินได้'
        : !summary.canRequestPayout && summary.availableBalance < minimum
          ? `ยอดต้องอย่างน้อย ${formatCurrency(minimum)}`
          : summary.canRequestPayout
            ? 'กดแล้วคำขอจะไปที่แอดมินเพื่อโอนเงินเข้าบัญชีของร้าน'
            : null;

  const canRequest = hasBankAccount && summary.canRequestPayout;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          ขั้นตอน 2
        </p>
        <h2 className="mt-1 font-display text-lg font-medium text-ink">ขอรับเงิน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ส่งคำขอให้แอดมินโอนเงินเข้าบัญชีที่บันทึกไว้
        </p>
      </div>

      <Card className="border-brand/30 ring-1 ring-brand/10">
        <CardHeader className="space-y-1">
          <h3 className="font-display text-base font-semibold text-ink">ขอรับเงินโอนเข้าบัญชี</h3>
          <p className="text-sm text-muted-foreground">
            จากยอดขายทุกช่องทางชำระเงิน หักค่าคอมมิชชันแล้ว
          </p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">ยอดพร้อมขอรับ</p>
            <p className="mt-1 font-display text-2xl font-medium tabular-nums text-ink">
              {formatCurrency(summary.availableBalance)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ขั้นต่ำ {formatCurrency(minimum)}
              {summary.totalPaidOut > 0 ? ` · โอนแล้ว ${formatCurrency(summary.totalPaidOut)}` : ''}
            </p>
          </div>
          <AvailableVendorBreakdown rail={summary} />

          {summary.pendingPayoutAmount > 0 ? (
            <div
              className="rounded-lg bg-warning-bg px-3 py-2.5 text-sm text-warning-text"
              role="status"
            >
              รอแอดมินโอนและอนุมัติ {formatCurrency(summary.pendingPayoutAmount)}
            </div>
          ) : null}

          <Button
            type="button"
            className="w-full"
            onClick={() => requestPayout.mutate()}
            disabled={!canRequest || requestPayout.isPending}
            aria-busy={requestPayout.isPending}
          >
            {requestPayout.isPending ? 'กำลังส่งคำขอ...' : 'ขอรับเงิน'}
          </Button>
          {disabledReason ? (
            <p className="text-sm text-muted-foreground">{disabledReason}</p>
          ) : null}

          {requestPayout.isError ? (
            <p className="text-sm text-danger" role="alert">
              {getErrorMessage(requestPayout.error, 'ส่งคำขอรับเงินไม่สำเร็จ')}
            </p>
          ) : null}
          {requestPayout.isSuccess ? (
            <p className="text-sm text-success" role="status">
              ส่งคำขอสำเร็จ — รอแอดมินโอนแล้วอนุมัติ
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
