'use client';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatCard } from '@/components/vendor/stat-card';
import {
  useAdminStorePayoutSummary,
  useAdminStorePayouts,
  useTriggerPayout,
} from '@/hooks/usePayouts';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  pending: 'รอดำเนินการ',
  processing: 'กำลังโอน',
  completed: 'สำเร็จ',
  failed: 'ล้มเหลว',
};

type AdminStorePayoutPanelProps = {
  storeId: string;
};

export function AdminStorePayoutPanel({ storeId }: AdminStorePayoutPanelProps) {
  const { data: summary, isLoading: summaryLoading } = useAdminStorePayoutSummary(storeId);
  const { data: payouts = [], isLoading: historyLoading } = useAdminStorePayouts(storeId);
  const triggerMutation = useTriggerPayout(storeId);

  const isLoading = summaryLoading || historyLoading;
  const unpaidBalance = summary ? Math.max(0, summary.grossRevenue - summary.totalPaidOut) : 0;

  return (
    <Card className="mt-6">
      <CardHeader>
        <h2 className="font-display font-medium text-ink">Payout ร้านค้า</h2>
        <p className="mt-1 text-sm text-muted">
          แอดมินสามารถ trigger payout ได้ทุกเมื่อ แม้ยอดจะต่ำกว่าขั้นต่ำของ vendor
        </p>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p className="text-muted">กำลังโหลด...</p>
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
                disabled={summary.availableBalance <= 0 || triggerMutation.isPending}
                aria-busy={triggerMutation.isPending}
              >
                {triggerMutation.isPending
                  ? 'กำลัง trigger...'
                  : `Trigger payout (${formatCurrency(summary.availableBalance)})`}
              </Button>
              {summary.availableBalance <= 0 ? (
                <p className="text-sm text-muted">ไม่มียอดที่ถอนได้ในขณะนี้</p>
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
              <p className="text-sm text-emerald-700" role="status">
                Trigger payout สำเร็จ
              </p>
            ) : null}

            {payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="px-2 py-2 font-medium">วันที่</th>
                      <th className="px-2 py-2 font-medium">จำนวนเงิน</th>
                      <th className="px-2 py-2 font-medium">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-b border-border/60">
                        <td className="px-2 py-2">{formatDateTime(payout.createdAt)}</td>
                        <td className="px-2 py-2">{formatCurrency(payout.amount)}</td>
                        <td className="px-2 py-2">
                          {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted">ยังไม่มีประวัติ payout</p>
            )}
          </div>
        ) : (
          <p className="text-muted">ไม่พบข้อมูล payout</p>
        )}
      </CardBody>
    </Card>
  );
}
