'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HelpDeepLink } from '@/components/help/help-deep-link';
import { CommissionBreakdown } from '@/components/payouts/commission-breakdown';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  usePendingManualPayouts,
  useRejectManualPayoutForQueue,
  useSettleManualPayoutForQueue,
} from '@/hooks/usePayouts';
import type { AdminManualPayout } from '@/lib/api/payouts';
import { getErrorMessage } from '@/lib/api/errors';
import {
  formatThaiBankAccountNumber,
  sanitizeBankAccountDigits,
} from '@/lib/banks/formatThaiBankAccountNumber';
import { commissionCopy } from '@/lib/i18n/th';
import { parsePageParam, serializePageParam } from '@/lib/navigation/list-query-params';
import { useListQueryState, type ListQuerySpec } from '@/lib/navigation/use-list-query-state';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';

function CopyAccountButton({ accountNumber }: { accountNumber: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        const digits = sanitizeBankAccountDigits(accountNumber);
        if (!digits) return;
        try {
          await navigator.clipboard.writeText(digits);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}
    </Button>
  );
}

function PayoutQueueRow({
  payout,
  busyId,
  onSettle,
  onReject,
  settlePending,
  rejectPending,
}: {
  payout: AdminManualPayout;
  busyId: string | null | undefined;
  onSettle: (input: { storeId: string; payoutId: string; notes?: string }) => void;
  onReject: (input: { storeId: string; payoutId: string; notes: string }) => void;
  settlePending: boolean;
  rejectPending: boolean;
}) {
  const [note, setNote] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const hasBank =
    Boolean(payout.bankName || payout.bankCode) &&
    Boolean(payout.bankAccountNumber) &&
    Boolean(payout.bankAccountName);
  const accountDisplay = payout.bankAccountNumber
    ? formatThaiBankAccountNumber(payout.bankAccountNumber)
    : null;
  const isBusy = busyId === payout.id;
  const noteFieldId = `payout-note-${payout.id}`;
  const breakdownId = `payout-breakdown-${payout.id}`;

  return (
    <li className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-6">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div className="min-w-0 space-y-1">
              <p className="font-display text-lg font-medium text-ink text-balance">
                {payout.storeName}
              </p>
              <p className="text-sm text-muted-foreground">
                ขอเมื่อ {formatDateTime(payout.createdAt)}
              </p>
              <Link
                href={`/admin/stores/${payout.storeId}`}
                className="inline-block text-sm text-brand underline-offset-2 hover:underline"
              >
                ดูหน้าร้าน
              </Link>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                ยอดที่ต้องโอน
              </p>
              <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-ink">
                {formatCurrency(payout.amount)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {commissionCopy.transfer.caption}
              </p>
            </div>
          </div>

          <section
            aria-label="บัญชีรับเงินของร้าน"
            className={cn(
              'rounded-lg border px-4 py-4',
              hasBank ? 'border-border bg-surface/70' : 'border-warning-text/30 bg-warning-bg',
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">โอนเข้าบัญชีนี้</h3>
              {!hasBank ? (
                <p className="text-xs font-medium text-warning-text">บัญชีไม่ครบ</p>
              ) : null}
            </div>

            {hasBank ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">ธนาคาร</dt>
                    <dd className="mt-0.5 font-medium text-ink">
                      {payout.bankName ?? payout.bankCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">ชื่อบัญชี</dt>
                    <dd className="mt-0.5 font-medium text-ink">{payout.bankAccountName}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">เลขที่บัญชี</dt>
                    <dd className="mt-0.5 font-display text-xl font-medium tabular-nums tracking-wide text-ink">
                      {accountDisplay}
                    </dd>
                  </div>
                </dl>
                {payout.bankAccountNumber ? (
                  <CopyAccountButton accountNumber={payout.bankAccountNumber} />
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-warning-text">
                ร้านยังไม่ได้บันทึกบัญชีธนาคาร — ตรวจที่หน้าร้านก่อนโอน
              </p>
            )}
          </section>

          <details className="group rounded-lg border border-border px-4 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                <span>รายละเอียดยอด</span>
                <span className="text-xs font-normal text-muted-foreground group-open:hidden">
                  ดูการคำนวณ
                </span>
                <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
                  ซ่อน
                </span>
              </span>
            </summary>
            <div id={breakdownId} className="mt-3 border-t border-border pt-3">
              <CommissionBreakdown
                variant="snapshot"
                audience="admin"
                productSold={payout.productSold}
                shippingFees={payout.shippingFees}
                commissionAmount={payout.commissionAmount}
                commissionRate={payout.commissionRate}
                netPayable={payout.amount}
                captions={{ frozen: commissionCopy.breakdown.hint.frozen }}
              />
            </div>
          </details>
        </div>

        <aside className="space-y-3 rounded-lg border border-border bg-surface/50 p-4 lg:sticky lg:top-4">
          <div className="space-y-1.5">
            <Label htmlFor={noteFieldId}>หมายเหตุถึงร้าน</Label>
            <Input
              id={noteFieldId}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                if (rejectError) setRejectError(null);
              }}
              placeholder="อ้างอิงการโอน หรือเหตุผลปฏิเสธ"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">บังคับเมื่อกดปฏิเสธ</p>
            {rejectError ? (
              <p className="text-xs text-danger" role="alert">
                {rejectError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              className="w-full"
              disabled={isBusy || !hasBank}
              onClick={() =>
                onSettle({
                  storeId: payout.storeId,
                  payoutId: payout.id,
                  notes: note.trim() || undefined,
                })
              }
            >
              {isBusy && settlePending ? 'กำลังอนุมัติ...' : 'อนุมัติหลังโอนแล้ว'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isBusy}
              onClick={() => {
                const reason = note.trim();
                if (!reason) {
                  setRejectError('กรุณาระบุเหตุผลก่อนปฏิเสธ');
                  return;
                }
                setRejectError(null);
                onReject({
                  storeId: payout.storeId,
                  payoutId: payout.id,
                  notes: reason,
                });
              }}
            >
              {isBusy && rejectPending ? 'กำลังปฏิเสธ...' : 'ปฏิเสธคำขอ'}
            </Button>
          </div>
        </aside>
      </div>
    </li>
  );
}

const pageOnlyQuerySpec = {
  page: { parse: parsePageParam, serialize: serializePageParam },
} satisfies ListQuerySpec;

export default function AdminManualPayoutsPage() {
  const [{ page }, setParams] = useListQueryState(pageOnlyQuerySpec);
  const { data, isLoading, isError } = usePendingManualPayouts(page);
  const settleMutation = useSettleManualPayoutForQueue();
  const rejectMutation = useRejectManualPayoutForQueue();

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const busyId = settleMutation.isPending
    ? settleMutation.variables?.payoutId
    : rejectMutation.isPending
      ? rejectMutation.variables?.payoutId
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payout Manual"
        description="คำขอรับเงินจากร้านค้า — คัดลอกบัญชี โอนเงิน แล้วกดอนุมัติ (หรือปฏิเสธพร้อมเหตุผล)"
        action={<HelpDeepLink role="admin" slug="manual-payouts" />}
      />

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">
            รอโอนและอนุมัติ
            {!isLoading && pagination ? (
              <span className="ml-1.5 text-base font-normal text-muted tabular-nums">
                ({pagination.total.toLocaleString('th-TH')})
              </span>
            ) : null}
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">โหลดรายการไม่สำเร็จ</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted">ไม่มีคำขอ payout รอดำเนินการ</p>
          ) : (
            <ul className="space-y-4">
              {items.map((payout) => (
                <PayoutQueueRow
                  key={payout.id}
                  payout={payout}
                  busyId={busyId}
                  settlePending={settleMutation.isPending}
                  rejectPending={rejectMutation.isPending}
                  onSettle={(input) => settleMutation.mutate(input)}
                  onReject={(input) => rejectMutation.mutate(input)}
                />
              ))}
            </ul>
          )}

          {settleMutation.isError ? (
            <p className="text-sm text-danger" role="alert">
              {getErrorMessage(settleMutation.error, 'อนุมัติไม่สำเร็จ')}
            </p>
          ) : null}
          {rejectMutation.isError ? (
            <p className="text-sm text-danger" role="alert">
              {getErrorMessage(rejectMutation.error, 'ปฏิเสธไม่สำเร็จ')}
            </p>
          ) : null}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1 || isLoading}
                onClick={() => setParams((p) => ({ page: Math.max(1, p.page - 1) }))}
              >
                ก่อนหน้า
              </Button>
              <p className="text-sm text-muted">
                หน้า {pagination.page} / {pagination.totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={page >= pagination.totalPages || isLoading}
                onClick={() => setParams((p) => ({ page: p.page + 1 }))}
              >
                ถัดไป
              </Button>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
