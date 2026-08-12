'use client';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatCard } from '@/components/vendor/stat-card';
import {
  useAdminStorePayoutSummary,
  useAdminStorePayouts,
  useRejectManualPayout,
  useSettleManualPayout,
  useTriggerPayout,
} from '@/hooks/usePayouts';
import { PAYOUT_STATUS_LABELS } from '@/lib/payouts/status-labels';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';

type AdminStorePayoutPanelProps = {
  storeId: string;
};

function PayoutSkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface motion-reduce:animate-none', className)}
    />
  );
}

function PayoutPanelSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="กำลังโหลดข้อมูล payout">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <PayoutSkeletonBlock key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <PayoutSkeletonBlock className="h-10 w-48" />
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

function railLabel(rail: string): string {
  if (rail === 'manual') return 'โอนเงินเข้าบัญชี';
  if (rail === 'omise') return 'Omise';
  return rail;
}

export function AdminStorePayoutPanel({ storeId }: AdminStorePayoutPanelProps) {
  const { data: summary, isLoading: summaryLoading } = useAdminStorePayoutSummary(storeId);
  const { data: payouts = [], isLoading: historyLoading } = useAdminStorePayouts(storeId);
  const triggerMutation = useTriggerPayout(storeId);
  const settleManualMutation = useSettleManualPayout(storeId);
  const rejectManualMutation = useRejectManualPayout(storeId);

  const isLoading = summaryLoading || historyLoading;
  const pendingManual = payouts.find(
    (payout) => payout.settlementRail === 'manual' && payout.status === 'pending',
  );
  const hasPendingManual = Boolean(summary && summary.manual.pendingPayoutAmount > 0);

  return (
    <section aria-labelledby="store-payout-heading" className="space-y-6">
      <Card>
        <CardHeader>
          <h2 id="store-payout-heading" className="font-display text-lg font-semibold text-ink">
            Payout ร้านค้า
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            แยกยอด Omise (PromptPay/บัตร) กับยอดโอนเงินเข้าบัญชี — โอนด้วยรางที่ต่างกัน
          </p>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <PayoutPanelSkeleton />
          ) : summary ? (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ink">Omise (PromptPay / บัตร)</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    label="ยอดที่ถอนได้ (Omise)"
                    value={formatCurrency(summary.omise.availableBalance)}
                    hint={`ขั้นต่ำ vendor ${formatCurrency(summary.minimumPayoutAmount)}`}
                  />
                  <StatCard
                    label="โอนแล้ว (Omise)"
                    value={formatCurrency(summary.omise.totalPaidOut)}
                    hint={`จากรายได้รวม ${formatCurrency(summary.omise.grossRevenue)}`}
                  />
                  <StatCard
                    label="รอดำเนินการ (Omise)"
                    value={formatCurrency(summary.omise.pendingPayoutAmount)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => triggerMutation.mutate(undefined)}
                    disabled={
                      triggerMutation.isPending ||
                      (summary.omise.availableBalance <= 0 && !summary.omise.canRequestPayout)
                    }
                    aria-busy={triggerMutation.isPending}
                  >
                    {triggerMutation.isPending
                      ? 'กำลัง trigger...'
                      : summary.omise.canRequestPayout && summary.omise.pendingPayoutAmount > 0
                        ? 'ส่งคำขอไป Omise อีกครั้ง'
                        : `Trigger Omise (${formatCurrency(summary.omise.availableBalance)})`}
                  </Button>
                  {summary.omise.availableBalance <= 0 && !summary.omise.canRequestPayout ? (
                    <p className="text-sm text-muted-foreground">ไม่มียอด Omise ที่ถอนได้</p>
                  ) : null}
                </div>
                {triggerMutation.isError ? (
                  <p className="text-sm text-danger" role="alert">
                    {triggerMutation.error instanceof Error
                      ? triggerMutation.error.message
                      : 'Trigger Omise payout ไม่สำเร็จ'}
                  </p>
                ) : null}
                {triggerMutation.isSuccess ? (
                  <p className="text-sm text-success" role="status">
                    Trigger Omise payout สำเร็จ
                  </p>
                ) : null}
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-ink">โอนเงินเข้าบัญชี (Manual)</h3>
                <p className="text-sm text-muted-foreground">
                  ร้านต้องขอรับเงินก่อน — แอดมินโอนนอกระบบแล้วกดอนุมัติ (หรือปฏิเสธคำขอ)
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    label="ยอดรอโอน (Manual)"
                    value={formatCurrency(summary.manual.availableBalance)}
                    hint={`จากรายได้รวม ${formatCurrency(summary.manual.grossRevenue)}`}
                  />
                  <StatCard
                    label="โอนแล้ว (Manual)"
                    value={formatCurrency(summary.manual.totalPaidOut)}
                  />
                  <StatCard
                    label="รออนุมัติ (Manual)"
                    value={formatCurrency(summary.manual.pendingPayoutAmount)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      settleManualMutation.mutate({
                        payoutId: pendingManual?.id,
                        notes: 'Admin transferred and approved',
                      })
                    }
                    disabled={settleManualMutation.isPending || !hasPendingManual}
                    aria-busy={settleManualMutation.isPending}
                  >
                    {settleManualMutation.isPending
                      ? 'กำลังอนุมัติ...'
                      : hasPendingManual
                        ? `อนุมัติหลังโอนแล้ว (${formatCurrency(summary.manual.pendingPayoutAmount)})`
                        : 'อนุมัติหลังโอนแล้ว'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      rejectManualMutation.mutate({
                        payoutId: pendingManual?.id,
                        notes: 'Admin rejected manual payout request',
                      })
                    }
                    disabled={rejectManualMutation.isPending || !hasPendingManual}
                    aria-busy={rejectManualMutation.isPending}
                  >
                    {rejectManualMutation.isPending ? 'กำลังปฏิเสธ...' : 'ปฏิเสธคำขอ'}
                  </Button>
                  {!hasPendingManual ? (
                    <p className="text-sm text-muted-foreground">
                      {summary.manual.availableBalance > 0
                        ? 'รอร้านกดขอรับเงินโอนเข้าบัญชี'
                        : 'ไม่มียอด Manual ที่ต้องโอน'}
                    </p>
                  ) : null}
                </div>
                {settleManualMutation.isError ? (
                  <p className="text-sm text-danger" role="alert">
                    {settleManualMutation.error instanceof Error
                      ? settleManualMutation.error.message
                      : 'อนุมัติ Manual payout ไม่สำเร็จ'}
                  </p>
                ) : null}
                {settleManualMutation.isSuccess ? (
                  <p className="text-sm text-success" role="status">
                    อนุมัติ Manual payout สำเร็จ
                  </p>
                ) : null}
                {rejectManualMutation.isError ? (
                  <p className="text-sm text-danger" role="alert">
                    {rejectManualMutation.error instanceof Error
                      ? rejectManualMutation.error.message
                      : 'ปฏิเสธ Manual payout ไม่สำเร็จ'}
                  </p>
                ) : null}
                {rejectManualMutation.isSuccess ? (
                  <p className="text-sm text-success" role="status">
                    ปฏิเสธคำขอ Manual payout แล้ว — ร้านสามารถขอใหม่ได้
                  </p>
                ) : null}
              </div>

              {payouts.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface text-left text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium" scope="col">
                          วันที่
                        </th>
                        <th className="px-4 py-2.5 font-medium" scope="col">
                          ราง
                        </th>
                        <th className="px-4 py-2.5 font-medium" scope="col">
                          จำนวนเงิน
                        </th>
                        <th className="px-4 py-2.5 font-medium" scope="col">
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-border/60 last:border-b-0">
                          <td className="px-4 py-2.5 tabular-nums">
                            {formatDateTime(payout.createdAt)}
                          </td>
                          <td className="px-4 py-2.5">{railLabel(payout.settlementRail)}</td>
                          <td className="px-4 py-2.5 tabular-nums font-medium">
                            {formatCurrency(payout.amount)}
                          </td>
                          <td className="px-4 py-2.5">
                            {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">ยังไม่มีประวัติ payout</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">ไม่พบข้อมูล payout</p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
