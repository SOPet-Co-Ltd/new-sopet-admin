'use client';

import { CommissionBreakdown } from '@/components/payouts/commission-breakdown';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import {
  useRequestManualPayout,
  useRequestPayout,
  useStorePayoutSummary,
} from '@/hooks/usePayouts';
import { useMyStore } from '@/hooks/useStoreSettings';
import { commissionCopy } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';
import type { PayoutRailSummary } from '@/types';
import { getErrorMessage } from '@/lib/api/errors';

function AvailableVendorBreakdown({ rail }: { rail: PayoutRailSummary }) {
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
    <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-live="polite">
      <div className="h-56 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
      <div className="h-56 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
      <span className="sr-only">กำลังโหลดยอดเงิน...</span>
    </div>
  );
}

export function VendorPayoutBalancePanel() {
  const { data: summary, isLoading, isError, error, refetch } = useStorePayoutSummary();
  const { data: store } = useMyStore();
  const requestOmise = useRequestPayout();
  const requestManual = useRequestManualPayout();

  const omise = summary?.omise;
  const manual = summary?.manual;
  const omiseVerified = store?.omiseRecipientStatus === 'active';
  const minimum = summary?.minimumPayoutAmount ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ขั้นตอน 3
          </p>
          <h2 className="mt-1 font-display text-lg font-medium text-ink">ขอรับเงิน</h2>
        </div>
        <BalanceSkeleton />
      </div>
    );
  }

  if (isError || !summary || !omise || !manual) {
    return (
      <Card>
        <CardBody className="space-y-3 p-6">
          <p className="text-sm font-medium text-ink">โหลดยอด payout ไม่สำเร็จ</p>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(error, 'ลองโหลดใหม่ หรือตรวจว่า backend migration settlement_rail รันแล้ว')}
          </p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            ลองใหม่
          </Button>
        </CardBody>
      </Card>
    );
  }

  const omiseDisabledReason = !omiseVerified
    ? 'บัญชี Omise ยังไม่ผ่านการยืนยัน — ทำขั้นตอน 2 ก่อน'
    : !omise.canRequestPayout && omise.pendingPayoutAmount > 0
      ? 'มีรายการ Omise ที่รอดำเนินการอยู่'
      : !omise.canRequestPayout && omise.availableBalance <= 0
        ? 'ยังไม่มียอด Omise จาก PromptPay/บัตร'
        : !omise.canRequestPayout && omise.availableBalance < minimum
          ? `ยอด Omise ต้องอย่างน้อย ${formatCurrency(minimum)}`
          : null;

  const canRequestOmise = omiseVerified && omise.canRequestPayout;
  const isOmiseRetry = Boolean(omise.canRequestPayout && omise.pendingPayoutAmount > 0);

  const manualHint = !manual.canRequestPayout
    ? manual.pendingPayoutAmount > 0
      ? 'มีคำขอ Manual ที่รอแอดมินโอนและอนุมัติอยู่แล้ว'
      : manual.availableBalance <= 0
        ? 'ยังไม่มียอดจากออเดอร์โอนเข้าบัญชี SOPET'
        : manual.availableBalance < minimum
          ? `ยอด Manual ต้องอย่างน้อย ${formatCurrency(minimum)}`
          : null
    : 'กดแล้วคำขอจะไปที่แอดมินเพื่อโอนเงินนอก Omise';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          ขั้นตอน 3
        </p>
        <h2 className="mt-1 font-display text-lg font-medium text-ink">ขอรับเงิน</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          แยกชัดสองช่องทาง — Omise อัตโนมัติ และ Manual ผ่านแอดมิน
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-brand/30 ring-1 ring-brand/10">
          <CardHeader className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              Manual · ส่งให้แอดมิน
            </p>
            <h3 className="font-display text-base font-semibold text-ink">ขอรับเงินโอนเข้าบัญชี</h3>
            <p className="text-sm text-muted-foreground">
              จากออเดอร์ที่ลูกค้าโอนเข้าบัญชี SOPET — ไม่ต้องรอ Omise ยืนยันบัญชี
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">ยอดพร้อมขอรับ</p>
              <p className="mt-1 font-display text-2xl font-medium tabular-nums text-ink">
                {formatCurrency(manual.availableBalance)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ขั้นต่ำ {formatCurrency(minimum)}
                {manual.totalPaidOut > 0 ? ` · โอนแล้ว ${formatCurrency(manual.totalPaidOut)}` : ''}
              </p>
            </div>
            <AvailableVendorBreakdown rail={manual} />

            {manual.pendingPayoutAmount > 0 ? (
              <div
                className="rounded-lg bg-warning-bg px-3 py-2.5 text-sm text-warning-text"
                role="status"
              >
                รอแอดมินโอนและอนุมัติ {formatCurrency(manual.pendingPayoutAmount)}
              </div>
            ) : null}

            <Button
              type="button"
              className="w-full"
              onClick={() => requestManual.mutate()}
              disabled={!manual.canRequestPayout || requestManual.isPending}
              aria-busy={requestManual.isPending}
            >
              {requestManual.isPending ? 'กำลังส่งคำขอ...' : 'ขอรับเงิน Manual (ส่งให้แอดมิน)'}
            </Button>
            {manualHint ? <p className="text-sm text-muted-foreground">{manualHint}</p> : null}

            {requestManual.isError ? (
              <p className="text-sm text-danger" role="alert">
                {getErrorMessage(requestManual.error, 'ส่งคำขอ Manual ไม่สำเร็จ')}
              </p>
            ) : null}
            {requestManual.isSuccess ? (
              <p className="text-sm text-success" role="status">
                ส่งคำขอสำเร็จ — รอแอดมินโอนแล้วอนุมัติ
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Omise · อัตโนมัติ
            </p>
            <h3 className="font-display text-base font-semibold text-ink">ขอรับเงิน Omise</h3>
            <p className="text-sm text-muted-foreground">
              จาก PromptPay / บัตร — โอนผ่าน Omise เมื่อบัญชีผ่านการยืนยันแล้ว
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">ยอดพร้อมถอน</p>
              <p className="mt-1 font-display text-2xl font-medium tabular-nums text-ink">
                {formatCurrency(omise.availableBalance)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ขั้นต่ำ {formatCurrency(minimum)}
                {omise.totalPaidOut > 0 ? ` · ถอนแล้ว ${formatCurrency(omise.totalPaidOut)}` : ''}
              </p>
            </div>
            <AvailableVendorBreakdown rail={omise} />

            {omise.pendingPayoutAmount > 0 ? (
              <div
                className="rounded-lg bg-warning-bg px-3 py-2.5 text-sm text-warning-text"
                role="status"
              >
                กำลังรอโอน Omise {formatCurrency(omise.pendingPayoutAmount)}
              </div>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => requestOmise.mutate()}
              disabled={!canRequestOmise || requestOmise.isPending}
              aria-busy={requestOmise.isPending}
            >
              {requestOmise.isPending
                ? 'กำลังส่งคำขอ...'
                : isOmiseRetry
                  ? 'ส่งคำขอโอน Omise อีกครั้ง'
                  : 'ขอรับเงิน Omise'}
            </Button>
            {omiseDisabledReason ? (
              <p className="text-sm text-muted-foreground">{omiseDisabledReason}</p>
            ) : null}

            {requestOmise.isError ? (
              <p className="text-sm text-danger" role="alert">
                {getErrorMessage(requestOmise.error, 'ส่งคำขอ Omise ไม่สำเร็จ')}
              </p>
            ) : null}
            {requestOmise.isSuccess ? (
              <p className="text-sm text-success" role="status">
                ส่งคำขอสำเร็จ — ระบบโอนผ่าน Omise
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
