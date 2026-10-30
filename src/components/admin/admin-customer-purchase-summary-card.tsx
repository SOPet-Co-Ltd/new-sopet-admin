'use client';

import { useCallback, useMemo, useState } from 'react';
import { InsightFact } from '@/components/customers/customer-detail-primitives';
import { CustomerSummaryMonthPicker } from '@/components/admin/customer-summary-month-picker';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useCustomerPurchaseSummary } from '@/hooks/useCustomerSummaries';
import {
  bangkokYearMonthFromDate,
  bangkokYearMonthNow,
  clampYearMonth,
  formatSummaryMonthLabel,
  formatTimeSinceLastOrder,
  type YearMonth,
} from '@/lib/analytics/summary-month';
import { getErrorMessage } from '@/lib/api/errors';
import { formatCurrency } from '@/lib/utils';

export function AdminCustomerPurchaseSummaryCard({
  customerId,
  accountCreatedAt,
}: {
  customerId: string;
  accountCreatedAt?: string | null;
}) {
  const minYearMonth = useMemo(
    () => (accountCreatedAt ? bangkokYearMonthFromDate(accountCreatedAt) : null),
    [accountCreatedAt],
  );
  const [selected, setSelected] = useState<YearMonth>(() =>
    clampYearMonth(
      bangkokYearMonthNow(),
      minYearMonth ?? { year: 2000, month: 1 },
      bangkokYearMonthNow(),
    ),
  );
  const handleMonthChange = useCallback((next: YearMonth) => {
    setSelected(next);
  }, []);
  const effectiveSelected = useMemo(
    () => clampYearMonth(selected, minYearMonth ?? { year: 2000, month: 1 }, bangkokYearMonthNow()),
    [selected, minYearMonth],
  );

  const { data, isLoading, error } = useCustomerPurchaseSummary(
    customerId,
    effectiveSelected.year,
    effectiveSelected.month,
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-balance text-ink">
            สรุปการซื้อรายเดือน
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Purchases/AOV ของ{' '}
            {formatSummaryMonthLabel(effectiveSelected.year, effectiveSelected.month)} ·
            สถานะและครั้งล่าสุดเป็นค่าคงที่ · ไม่รวมยกเลิก คืนเงิน หรือรอชำระ
          </p>
        </div>
        <CustomerSummaryMonthPicker
          id="customer-purchase-summary-month"
          year={effectiveSelected.year}
          month={effectiveSelected.month}
          minYearMonth={minYearMonth}
          onChange={handleMonthChange}
        />
      </CardHeader>
      <CardBody>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {getErrorMessage(error, 'โหลดสรุปการซื้อไม่สำเร็จ')}
          </p>
        ) : null}
        {isLoading ? (
          <p className="text-sm text-muted-foreground" aria-busy="true">
            กำลังโหลดสรุป...
          </p>
        ) : null}
        {!isLoading && !error && data ? (
          <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <InsightFact
              label="สั่งซื้อครั้งล่าสุด"
              hint="นับถึงวันนี้ · ไม่เปลี่ยนตามเดือนที่เลือก"
            >
              {formatTimeSinceLastOrder(data.monthsSinceLastOrder, data.daysSinceLastOrder)}
            </InsightFact>
            <InsightFact label="Purchases per Month" hint="เฉพาะเดือนที่เลือก">
              {data.purchasesInMonth.toLocaleString('th-TH')} ครั้ง
            </InsightFact>
            <InsightFact label="AOV (ยอดต่อออเดอร์)" hint="เฉพาะเดือนที่เลือก">
              {data.averageOrderValue != null ? formatCurrency(data.averageOrderValue) : '—'}
            </InsightFact>
            <InsightFact
              label="สถานะลูกค้า"
              hint="จากประวัติทั้งหมด · ใหม่ = สั่ง 1 ครั้ง · เก่า = สั่ง 2 ครั้งขึ้นไป"
            >
              {data.cohortLabelTh}
            </InsightFact>
          </dl>
        ) : null}
      </CardBody>
    </Card>
  );
}
