'use client';

import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { useRequestPayout, useStorePayoutSummary } from '@/hooks/usePayouts';
import { formatCurrency } from '@/lib/utils';

function blockerMessage(summary: {
  availableBalance: number;
  minimumPayoutAmount: number;
  pendingPayoutAmount: number;
  canRequestPayout: boolean;
}): string | null {
  if (summary.canRequestPayout && summary.pendingPayoutAmount > 0) {
    return 'มีรายการที่ยังไม่ได้ส่งไประบบโอนเงิน — กดเพื่อส่งอีกครั้งหลังบัญชีพร้อมรับเงิน';
  }
  if (summary.canRequestPayout) return null;
  if (summary.pendingPayoutAmount > 0) {
    return 'มีรายการ payout ที่รอดำเนินการอยู่ โปรดรอให้โอนเสร็จก่อนขอครั้งถัดไป';
  }
  if (summary.availableBalance <= 0) {
    return 'ยังไม่มียอดพร้อมถอนจากคำสั่งซื้อที่ชำระแล้ว';
  }
  if (summary.availableBalance < summary.minimumPayoutAmount) {
    return `ยอดพร้อมถอนต้องอย่างน้อย ${formatCurrency(summary.minimumPayoutAmount)}`;
  }
  return null;
}

function BalanceSkeleton() {
  return (
    <div className="space-y-4 p-5 sm:p-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-28 animate-pulse rounded bg-surface motion-reduce:animate-none" />
      <div className="h-9 w-48 animate-pulse rounded bg-surface motion-reduce:animate-none" />
      <div className="h-4 w-64 animate-pulse rounded bg-surface motion-reduce:animate-none" />
      <div className="grid gap-4 pt-2 sm:grid-cols-3">
        <div className="h-14 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
        <div className="h-14 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
        <div className="h-14 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
      </div>
      <span className="sr-only">กำลังโหลดยอดเงิน...</span>
    </div>
  );
}

export function VendorPayoutBalancePanel() {
  const { data: summary, isLoading } = useStorePayoutSummary();
  const requestMutation = useRequestPayout();

  const hint = summary ? blockerMessage(summary) : null;
  const isRetry = Boolean(summary?.canRequestPayout && summary.pendingPayoutAmount > 0);

  return (
    <Card>
      <CardBody className="p-0">
        {isLoading ? (
          <BalanceSkeleton />
        ) : summary ? (
          <div className="divide-y divide-border">
            <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">ยอดพร้อมถอน</p>
                <p className="mt-1 break-words font-display text-2xl font-medium tracking-tight text-ink tabular-nums sm:text-3xl">
                  {formatCurrency(summary.availableBalance)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  ขั้นต่ำ {formatCurrency(summary.minimumPayoutAmount)}
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[16rem] lg:items-end">
                <Button
                  type="button"
                  className="h-11 w-full px-6 lg:w-auto"
                  onClick={() => requestMutation.mutate()}
                  disabled={!summary.canRequestPayout || requestMutation.isPending}
                  aria-busy={requestMutation.isPending}
                >
                  {requestMutation.isPending
                    ? 'กำลังส่งคำขอ...'
                    : isRetry
                      ? 'ส่งคำขอโอนเงินอีกครั้ง'
                      : 'ขอรับเงิน'}
                </Button>
                {hint ? (
                  <p className="text-sm text-muted-foreground lg:text-right">{hint}</p>
                ) : null}
              </div>
            </div>

            {summary.pendingPayoutAmount > 0 ? (
              <div
                className="flex flex-col gap-1 bg-warning-bg px-5 py-3 text-sm text-warning-text sm:flex-row sm:items-center sm:justify-between sm:px-6"
                role="status"
              >
                <p className="font-medium">
                  กำลังรอโอน {formatCurrency(summary.pendingPayoutAmount)}
                </p>
                <p className="opacity-90">
                  {isRetry ? 'ยังไม่ได้สร้างคำขอโอนเงิน' : 'ระบบกำลังดำเนินการโอนเข้าบัญชีของคุณ'}
                </p>
              </div>
            ) : null}

            <dl className="grid min-w-0 gap-4 px-5 py-4 sm:grid-cols-3 sm:px-6">
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">รายได้รวม</dt>
                <dd className="mt-1 break-words font-display text-lg font-medium text-ink tabular-nums">
                  {formatCurrency(summary.grossRevenue)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">กำลังดำเนินการ</dt>
                <dd className="mt-1 break-words font-display text-lg font-medium text-ink tabular-nums">
                  {formatCurrency(summary.pendingPayoutAmount)}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">ขอรับแล้ว (รวมรอดำเนินการ)</dt>
                <dd className="mt-1 break-words font-display text-lg font-medium text-ink tabular-nums">
                  {formatCurrency(summary.totalPaidOut)}
                </dd>
              </div>
            </dl>

            {requestMutation.isError ? (
              <p className="px-5 py-3 text-sm text-danger sm:px-6" role="alert">
                {requestMutation.error instanceof Error
                  ? requestMutation.error.message
                  : 'ส่งคำขอ payout ไม่สำเร็จ'}
              </p>
            ) : null}
            {requestMutation.isSuccess ? (
              <p className="px-5 py-3 text-sm text-success sm:px-6" role="status">
                ส่งคำขอสำเร็จ ระบบกำลังดำเนินการโอนเงิน
              </p>
            ) : null}
          </div>
        ) : (
          <div className="p-6">
            <p className="text-sm font-medium text-ink">ไม่พบข้อมูล payout</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ลองโหลดหน้าใหม่ หรือติดต่อทีมสนับสนุนหากปัญหายังอยู่
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
