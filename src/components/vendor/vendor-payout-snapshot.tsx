'use client';

import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import { CommissionBreakdown } from '@/components/payouts/commission-breakdown';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useRequestPayout, useStorePayoutSummary } from '@/hooks/usePayouts';
import { useMyStore } from '@/hooks/useStoreSettings';
import { commissionCopy } from '@/lib/i18n/th';
import { resolveBankVerificationStatus } from '@/lib/payouts/bank-verification';
import { formatCurrency } from '@/lib/utils';
import type { PayoutSummary } from '@/types';
import { getErrorMessage } from '@/lib/api/errors';

function AvailableVendorSnapshotBreakdown({ rail }: { rail: PayoutSummary }) {
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

export function VendorPayoutSnapshot() {
  const { isOwner } = useIsStoreOwner();
  const { data: summary, isLoading: summaryLoading } = useStorePayoutSummary(isOwner);
  const { data: store, isLoading: storeLoading } = useMyStore();
  const requestPayout = useRequestPayout();

  if (!isOwner) return null;

  const isLoading = summaryLoading || storeLoading;
  const bankStatus = resolveBankVerificationStatus(store?.bankAccountVerificationStatus);
  const bankVerified = bankStatus === 'verified';
  const needsBankSetup = !store?.bankAccountNumber;
  const canRequest = Boolean(bankVerified && summary?.canRequestPayout);

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
          ) : summary ? (
            <>
              <div className="space-y-3 rounded-lg border border-brand/25 bg-brand-tint/40 p-4">
                <div>
                  <p className="text-sm text-muted">ยอดพร้อมขอรับเงิน</p>
                  <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">
                    {formatCurrency(summary.availableBalance)}
                  </p>
                  <AvailableVendorSnapshotBreakdown rail={summary} />
                  {!needsBankSetup && !bankVerified ? (
                    <p className="mt-1 text-sm text-amber-800">
                      {bankStatus === 'rejected'
                        ? 'บัญชีไม่ผ่านการตรวจสอบ — แก้ไขที่หน้า รับเงิน'
                        : 'บัญชีรอทีม SOPET ตรวจสอบ — ขอรับเงินได้เมื่อผ่านแล้ว'}
                    </p>
                  ) : summary.pendingPayoutAmount > 0 ? (
                    <p className="mt-1 text-sm text-amber-800">
                      ส่งคำขอแล้ว — รอแอดมินโอนและอนุมัติ{' '}
                      {formatCurrency(summary.pendingPayoutAmount)}
                    </p>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => requestPayout.mutate()}
                  disabled={!canRequest || requestPayout.isPending}
                  aria-busy={requestPayout.isPending}
                >
                  {requestPayout.isPending ? 'กำลังส่งคำขอ...' : 'ขอรับเงิน'}
                </Button>
              </div>

              {needsBankSetup ? (
                <p className="text-sm text-amber-900">
                  ยังไม่ได้ตั้งบัญชีรับเงิน — บันทึกบัญชีธนาคารเพื่อเริ่มรับเงินจากยอดขาย
                </p>
              ) : null}

              {requestPayout.isError ? (
                <p className="text-sm text-danger" role="alert">
                  {getErrorMessage(requestPayout.error, 'ส่งคำขอรับเงินไม่สำเร็จ')}
                </p>
              ) : null}
              {requestPayout.isSuccess ? (
                <p className="text-sm text-success" role="status">
                  ส่งคำขอสำเร็จ — รอแอดมินโอนแล้วอนุมัติ
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
