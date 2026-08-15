'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CommissionBreakdown } from '@/components/payouts/commission-breakdown';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  usePendingManualPayouts,
  useRejectManualPayoutForQueue,
  useSettleManualPayoutForQueue,
} from '@/hooks/usePayouts';
import { formatThaiBankAccountNumber } from '@/lib/banks/formatThaiBankAccountNumber';
import { commissionCopy } from '@/lib/i18n/th';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { AdminManualPayout } from '@/lib/api/payouts';

function SnapshotQueueBreakdown({ payout }: { payout: AdminManualPayout }) {
  return (
    <CommissionBreakdown
      variant="snapshot"
      audience="admin"
      productSold={payout.productSold}
      shippingFees={payout.shippingFees}
      commissionAmount={payout.commissionAmount}
      netPayable={payout.amount}
      captions={{ frozen: commissionCopy.breakdown.hint.frozen }}
    />
  );
}

export default function AdminManualPayoutsPage() {
  const [page, setPage] = useState(1);
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
        description="คำขอรับเงินจากยอดโอนเข้าบัญชี SOPET — โอนให้ร้านนอกระบบแล้วกดอนุมัติ (หรือปฏิเสธ)"
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
            <p className="text-sm text-muted">ไม่มีคำขอ Manual payout รอดำเนินการ</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((payout) => {
                const hasBank =
                  Boolean(payout.bankName || payout.bankCode) &&
                  Boolean(payout.bankAccountNumber) &&
                  Boolean(payout.bankAccountName);
                const accountDisplay = payout.bankAccountNumber
                  ? formatThaiBankAccountNumber(payout.bankAccountNumber)
                  : null;

                return (
                  <li
                    key={payout.id}
                    className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium text-ink">{payout.storeName}</p>
                        <p className="text-muted">{formatDateTime(payout.createdAt)}</p>
                        <p className="font-display text-lg font-medium tabular-nums text-ink">
                          {formatCurrency(payout.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {commissionCopy.transfer.caption}
                        </p>
                        <SnapshotQueueBreakdown payout={payout} />
                      </div>

                      <div className="rounded-lg border border-border bg-surface/60 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          บัญชีรับเงินของร้าน
                        </p>
                        {hasBank ? (
                          <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
                            <div>
                              <dt className="text-xs text-muted-foreground">ธนาคาร</dt>
                              <dd className="font-medium text-ink">
                                {payout.bankName ?? payout.bankCode}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">ชื่อบัญชี</dt>
                              <dd className="font-medium text-ink">{payout.bankAccountName}</dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="text-xs text-muted-foreground">เลขที่บัญชี</dt>
                              <dd className="font-medium tabular-nums tracking-wide text-ink">
                                {accountDisplay}
                              </dd>
                            </div>
                          </dl>
                        ) : (
                          <p className="mt-2 text-sm text-warning-text">
                            ร้านยังไม่ได้บันทึกบัญชีธนาคาร — ตรวจที่หน้าร้านก่อนโอน
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/admin/stores/${payout.storeId}`}
                        className="inline-block text-sm text-brand underline-offset-2 hover:underline"
                      >
                        ดูหน้าร้าน / รายละเอียดเพิ่มเติม
                      </Link>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={busyId === payout.id || !hasBank}
                        onClick={() =>
                          settleMutation.mutate({
                            storeId: payout.storeId,
                            payoutId: payout.id,
                            notes: 'Admin transferred and approved from queue',
                          })
                        }
                      >
                        {busyId === payout.id && settleMutation.isPending
                          ? 'กำลังอนุมัติ...'
                          : 'อนุมัติหลังโอนแล้ว'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === payout.id}
                        onClick={() =>
                          rejectMutation.mutate({
                            storeId: payout.storeId,
                            payoutId: payout.id,
                            notes: 'Admin rejected from manual payout queue',
                          })
                        }
                      >
                        {busyId === payout.id && rejectMutation.isPending
                          ? 'กำลังปฏิเสธ...'
                          : 'ปฏิเสธ'}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {settleMutation.isError ? (
            <p className="text-sm text-danger" role="alert">
              {settleMutation.error instanceof Error
                ? settleMutation.error.message
                : 'อนุมัติไม่สำเร็จ'}
            </p>
          ) : null}
          {rejectMutation.isError ? (
            <p className="text-sm text-danger" role="alert">
              {rejectMutation.error instanceof Error
                ? rejectMutation.error.message
                : 'ปฏิเสธไม่สำเร็จ'}
            </p>
          ) : null}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => p + 1)}
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
