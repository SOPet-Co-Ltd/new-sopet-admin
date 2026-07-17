'use client';

import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useStorePayoutSummary } from '@/hooks/usePayouts';
import { useMyStore } from '@/hooks/useStoreSettings';
import { formatCurrency } from '@/lib/utils';

export function VendorPayoutSnapshot() {
  const { isOwner } = useIsStoreOwner();
  const { data: summary, isLoading: summaryLoading } = useStorePayoutSummary();
  const { data: store, isLoading: storeLoading } = useMyStore();

  if (!isOwner) return null;

  const isLoading = summaryLoading || storeLoading;
  const needsSetup =
    store?.omiseRecipientStatus === 'not_connected' || store?.omiseRecipientStatus === 'failed';
  const isPending = store?.omiseRecipientStatus === 'pending';

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
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังโหลดยอดเงิน...</p>
          ) : summary ? (
            <>
              <div>
                <p className="text-sm text-muted">ยอดพร้อมถอน</p>
                <p className="mt-1 text-2xl font-semibold text-ink">
                  {formatCurrency(summary.availableBalance)}
                </p>
                {summary.pendingPayoutAmount > 0 ? (
                  <p className="mt-1 text-sm text-amber-800">
                    กำลังรอโอน {formatCurrency(summary.pendingPayoutAmount)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                {needsSetup ? (
                  <p className="text-sm text-amber-900">
                    ยังไม่ได้ตั้งบัญชีรับเงิน — บันทึกบัญชีธนาคารเพื่อเริ่มรับเงินจากยอดขาย
                  </p>
                ) : null}
                {isPending ? (
                  <p className="text-sm text-muted">ระบบกำลังตรวจสอบบัญชีธนาคารของคุณ</p>
                ) : null}
                <Button size="sm" asChild className="w-full sm:w-auto">
                  <Link href="/vendor/settings?tab=payout">
                    {needsSetup ? 'ตั้งบัญชีรับเงิน' : 'ดูรายละเอียดรับเงิน'}
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">ไม่พบข้อมูลรายได้</p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
