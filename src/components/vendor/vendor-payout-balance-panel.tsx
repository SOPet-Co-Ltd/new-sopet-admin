'use client';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatCard } from '@/components/vendor/stat-card';
import { useRequestPayout, useStorePayoutSummary, useStorePayouts } from '@/hooks/usePayouts';
import { PAYOUT_STATUS_LABELS } from '@/lib/payouts/status-labels';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export function VendorPayoutBalancePanel() {
  const { data: summary, isLoading: summaryLoading } = useStorePayoutSummary();
  const { data: payouts = [], isLoading: historyLoading } = useStorePayouts();
  const requestMutation = useRequestPayout();

  const isLoading = summaryLoading || historyLoading;
  const unpaidBalance = summary ? Math.max(0, summary.grossRevenue - summary.totalPaidOut) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">ยอดเงินรับ payout</h2>
          <p className="mt-1 text-sm text-muted">ยอดที่ถอนได้และยอดที่ระบบยังไม่ได้โอนให้ร้าน</p>
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
                  hint={`ขั้นต่ำ ${formatCurrency(summary.minimumPayoutAmount)}`}
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
                      : 'ยอดคงเหลือที่ยังไม่ถูกโอน'
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => requestMutation.mutate()}
                  disabled={!summary.canRequestPayout || requestMutation.isPending}
                  aria-busy={requestMutation.isPending}
                >
                  {requestMutation.isPending ? 'กำลังส่งคำขอ...' : 'ขอรับเงิน payout'}
                </Button>
                {!summary.canRequestPayout ? (
                  <p className="text-sm text-muted">
                    {summary.pendingPayoutAmount > 0
                      ? 'มีรายการ payout ที่รอดำเนินการอยู่'
                      : summary.availableBalance < summary.minimumPayoutAmount
                        ? `ยอดถอนได้ต้องไม่ต่ำกว่า ${formatCurrency(summary.minimumPayoutAmount)}`
                        : 'ไม่มียอดที่ถอนได้ในขณะนี้'}
                  </p>
                ) : null}
              </div>

              {requestMutation.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {requestMutation.error instanceof Error
                    ? requestMutation.error.message
                    : 'ส่งคำขอ payout ไม่สำเร็จ'}
                </p>
              ) : null}
              {requestMutation.isSuccess ? (
                <p className="text-sm text-emerald-700" role="status">
                  ส่งคำขอ payout สำเร็จ ระบบกำลังดำเนินการโอนเงิน
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-muted">ไม่พบข้อมูล payout</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-display font-medium text-ink">ประวัติ payout</h3>
        </CardHeader>
        <CardBody>
          {historyLoading ? (
            <p className="text-muted">กำลังโหลด...</p>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีประวัติ payout</p>
          ) : (
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
          )}
        </CardBody>
      </Card>
    </div>
  );
}
