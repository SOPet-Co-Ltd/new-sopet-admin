'use client';

import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import { CommissionBreakdown } from '@/components/payouts/commission-breakdown';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import {
  useRequestManualPayout,
  useRequestPayout,
  useStorePayoutSummary,
} from '@/hooks/usePayouts';
import { useMyStore } from '@/hooks/useStoreSettings';
import { commissionCopy } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';
import type { PayoutRailSummary } from '@/types';

function AvailableVendorSnapshotBreakdown({ rail }: { rail: PayoutRailSummary }) {
  return (
    <CommissionBreakdown
      variant="available"
      audience="vendor"
      productSold={rail.productSold}
      shippingFees={rail.shippingFees}
      commissionAmount={rail.commissionAmount}
      netPayable={rail.availableBalance}
      captions={{
        combined: commissionCopy.breakdown.hint.combined,
        shipping: commissionCopy.breakdown.hint.shipping,
        payoutTime: commissionCopy.breakdown.hint.payoutTime,
      }}
    />
  );
}

export function VendorPayoutSnapshot() {
  const { isOwner } = useIsStoreOwner();
  const { data: summary, isLoading: summaryLoading } = useStorePayoutSummary(isOwner);
  const { data: store, isLoading: storeLoading } = useMyStore();
  const requestOmise = useRequestPayout();
  const requestManual = useRequestManualPayout();

  if (!isOwner) return null;

  const isLoading = summaryLoading || storeLoading;
  const omiseVerified = store?.omiseRecipientStatus === 'active';
  const needsBankSetup = !store?.bankAccountNumber;
  const omise = summary?.omise;
  const manual = summary?.manual;
  const canRequestOmise = Boolean(omiseVerified && omise?.canRequestPayout);

  return (
    <section aria-labelledby="vendor-payout-snapshot-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="vendor-payout-snapshot-heading" className="text-lg font-medium text-ink">
            รายได้และการรับเงิน
          </h2>
          <p className="text-sm text-muted">ยอดพร้อมถอนและสถานะการโอนเข้าบัญชีธนาคาร</p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href="/vendor/settings?tab=payout">
            จัดการรับเงิน
            <HiArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-5">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังโหลดยอดเงิน...</p>
          ) : summary && omise && manual ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-brand/25 bg-brand-tint/40 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                      Manual · ส่งให้แอดมิน
                    </p>
                    <p className="mt-1 text-sm text-muted">ยอดจากลูกค้าโอนเข้าบัญชี SOPET</p>
                    <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                      {formatCurrency(manual.availableBalance)}
                    </p>
                    <AvailableVendorSnapshotBreakdown rail={manual} />
                    {manual.pendingPayoutAmount > 0 ? (
                      <p className="mt-1 text-sm text-amber-800">
                        ส่งคำขอแล้ว — รอแอดมินโอนและอนุมัติ{' '}
                        {formatCurrency(manual.pendingPayoutAmount)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => requestManual.mutate()}
                    disabled={!manual.canRequestPayout || requestManual.isPending}
                    aria-busy={requestManual.isPending}
                  >
                    {requestManual.isPending
                      ? 'กำลังส่งคำขอ...'
                      : 'ขอรับเงิน Manual (ส่งให้แอดมิน)'}
                  </Button>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Omise · อัตโนมัติ
                    </p>
                    <p className="mt-1 text-sm text-muted">ยอด PromptPay / บัตร</p>
                    <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                      {formatCurrency(omise.availableBalance)}
                    </p>
                    <AvailableVendorSnapshotBreakdown rail={omise} />
                    {!omiseVerified ? (
                      <p className="mt-1 text-sm text-amber-800">
                        บัญชียังไม่ผ่าน Omise — ไปยืนยันที่หน้า รับเงิน
                      </p>
                    ) : omise.pendingPayoutAmount > 0 ? (
                      <p className="mt-1 text-sm text-amber-800">
                        กำลังรอโอน Omise {formatCurrency(omise.pendingPayoutAmount)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => requestOmise.mutate()}
                    disabled={!canRequestOmise || requestOmise.isPending}
                    aria-busy={requestOmise.isPending}
                  >
                    {requestOmise.isPending ? 'กำลังส่งคำขอ...' : 'ขอรับเงิน Omise'}
                  </Button>
                </div>
              </div>

              {needsBankSetup ? (
                <p className="text-sm text-amber-900">
                  ยังไม่ได้ตั้งบัญชีรับเงิน — บันทึกบัญชีธนาคารเพื่อเริ่มรับเงินจากยอดขาย
                </p>
              ) : null}

              {requestManual.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {requestManual.error instanceof Error
                    ? requestManual.error.message
                    : 'ส่งคำขอ Manual ไม่สำเร็จ'}
                </p>
              ) : null}
              {requestOmise.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {requestOmise.error instanceof Error
                    ? requestOmise.error.message
                    : 'ส่งคำขอ Omise ไม่สำเร็จ'}
                </p>
              ) : null}
              {requestManual.isSuccess ? (
                <p className="text-sm text-success" role="status">
                  ส่งคำขอ Manual สำเร็จ — รอแอดมินโอนแล้วอนุมัติ
                </p>
              ) : null}

              <div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/vendor/settings?tab=payout">
                    {needsBankSetup ? 'ตั้งบัญชีรับเงิน' : 'ดูรายละเอียด / ประวัติรับเงิน'}
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">ไม่พบข้อมูลรายได้ — ลองโหลดหน้าใหม่</p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
