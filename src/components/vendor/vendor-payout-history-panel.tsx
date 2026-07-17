'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useStorePayouts } from '@/hooks/usePayouts';
import { PAYOUT_STATUS_LABELS } from '@/lib/payouts/status-labels';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';

const PAYOUT_BADGE_STATUS: Record<string, string> = {
  pending: 'pending_payment',
  processing: 'processing',
  completed: 'delivered',
  failed: 'cancelled',
};

function HistorySkeleton() {
  return (
    <ul className="space-y-3" aria-busy="true" aria-live="polite">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
          aria-hidden
        >
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-3 w-32 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
        </li>
      ))}
      <li className="sr-only">กำลังโหลดประวัติ...</li>
    </ul>
  );
}

export function VendorPayoutHistoryPanel() {
  const { data: payouts = [], isLoading } = useStorePayouts();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 bg-surface/60">
        <div>
          <h2 className="font-display text-lg font-medium text-ink text-balance">
            ประวัติการรับเงิน
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">รายการคำขอโอนล่าสุด</p>
        </div>
        {!isLoading && payouts.length > 0 ? (
          <span className="text-xs text-muted-foreground">{payouts.length} รายการ</span>
        ) : null}
      </CardHeader>
      <CardBody className="pt-0">
        {isLoading ? (
          <HistorySkeleton />
        ) : payouts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">ยังไม่มีประวัติ</p>
            <p className="mt-1 text-sm text-muted-foreground">
              เมื่อขอรับเงินสำเร็จ รายการจะแสดงที่นี่
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink tabular-nums">
                    {formatCurrency(payout.amount)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(payout.createdAt)}
                  </p>
                </div>
                <Badge
                  status={PAYOUT_BADGE_STATUS[payout.status]}
                  className={cn(payout.status === 'pending' && 'bg-warning-bg text-warning-text')}
                >
                  {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
