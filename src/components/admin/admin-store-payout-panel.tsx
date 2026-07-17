'use client';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatCard } from '@/components/vendor/stat-card';
import {
  useAdminStorePayoutSummary,
  useAdminStorePayouts,
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

export function AdminStorePayoutPanel({ storeId }: AdminStorePayoutPanelProps) {
  const { data: summary, isLoading: summaryLoading } = useAdminStorePayoutSummary(storeId);
  const { data: payouts = [], isLoading: historyLoading } = useAdminStorePayouts(storeId);
  const triggerMutation = useTriggerPayout(storeId);

  const isLoading = summaryLoading || historyLoading;
  const unpaidBalance = summary ? Math.max(0, summary.grossRevenue - summary.totalPaidOut) : 0;

  return (
    <section aria-labelledby="store-payout-heading">
      <Card>
        <CardHeader>
          <h2 id="store-payout-heading" className="font-display text-lg font-semibold text-ink">
            Payout ร้านค้า
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            แอดมินสามารถ trigger payout ได้ทุกเมื่อ แม้ยอดจะต่ำกว่าขั้นต่ำของ vendor
          </p>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <PayoutPanelSkeleton />
          ) : summary ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="ยอดที่ถอนได้"
                  value={formatCurrency(summary.availableBalance)}
                  hint={`ขั้นต่ำ vendor ${formatCurrency(summary.minimumPayoutAmount)}`}
                />
                <StatCard
                  label="โอนแล้ว"
                  value={formatCurrency(summary.totalPaidOut)}
                  hint={`จากรายได้รวม ${formatCurrency(summary.grossRevenue)}`}
                />
                <StatCard
                  label="ยังไม่ได้รับจากระบบ"
                  value={formatCurrency(unpaidBalance)}
                  hint={
                    summary.pendingPayoutAmount > 0
                      ? `รอโอน ${formatCurrency(summary.pendingPayoutAmount)}`
                      : undefined
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => triggerMutation.mutate(undefined)}
                  disabled={
                    triggerMutation.isPending ||
                    (summary.availableBalance <= 0 && !summary.canRequestPayout)
                  }
                  aria-busy={triggerMutation.isPending}
                >
                  {triggerMutation.isPending
                    ? 'กำลัง trigger...'
                    : summary.canRequestPayout && summary.pendingPayoutAmount > 0
                      ? 'ส่งคำขอไป Omise อีกครั้ง'
                      : `Trigger payout (${formatCurrency(summary.availableBalance)})`}
                </Button>
                {summary.availableBalance <= 0 && !summary.canRequestPayout ? (
                  <p className="text-sm text-muted-foreground">ไม่มียอดที่ถอนได้ในขณะนี้</p>
                ) : summary.canRequestPayout && summary.pendingPayoutAmount > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    มีรายการที่ยังไม่ได้ส่งไป Omise — กดเพื่อส่งอีกครั้ง
                  </p>
                ) : null}
              </div>

              {triggerMutation.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {triggerMutation.error instanceof Error
                    ? triggerMutation.error.message
                    : 'Trigger payout ไม่สำเร็จ'}
                </p>
              ) : null}
              {triggerMutation.isSuccess ? (
                <p className="text-sm text-success" role="status">
                  Trigger payout สำเร็จ
                </p>
              ) : null}

              {payouts.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface text-left text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium" scope="col">
                          วันที่
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
