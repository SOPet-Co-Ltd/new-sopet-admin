'use client';

import { useCallback, useMemo, useState } from 'react';
import { InsightFact } from '@/components/customers/customer-detail-primitives';
import { CustomerSummaryMonthPicker } from '@/components/admin/customer-summary-month-picker';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useStoreCustomerSummary } from '@/hooks/useCustomerSummaries';
import {
  bangkokYearMonthFromDate,
  bangkokYearMonthNow,
  clampYearMonth,
  formatOptionalNumber,
  formatPercent,
  formatSummaryMonthLabel,
  type YearMonth,
} from '@/lib/analytics/summary-month';
import { getErrorMessage } from '@/lib/api/errors';
import { formatCurrency } from '@/lib/utils';

export function AdminStoreCustomerSummaryCard({
  storeId,
  storeCreatedAt,
}: {
  storeId: string;
  storeCreatedAt?: string | null;
}) {
  const minYearMonth = useMemo(
    () => (storeCreatedAt ? bangkokYearMonthFromDate(storeCreatedAt) : null),
    [storeCreatedAt],
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

  const { data, isLoading, error } = useStoreCustomerSummary(
    storeId,
    effectiveSelected.year,
    effectiveSelected.month,
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-balance text-ink">
            สรุปลูกค้าของร้าน
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            สรุปลูกค้าของร้าน ·{' '}
            {formatSummaryMonthLabel(effectiveSelected.year, effectiveSelected.month)} ·
            เลือกได้ตั้งแต่เดือนที่สร้างร้าน · ไม่รวมยกเลิก คืนเงิน หรือรอชำระ
          </p>
        </div>
        <CustomerSummaryMonthPicker
          id="store-customer-summary-month"
          year={effectiveSelected.year}
          month={effectiveSelected.month}
          minYearMonth={minYearMonth}
          onChange={handleMonthChange}
        />
      </CardHeader>
      <CardBody>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {getErrorMessage(error, 'โหลดสรุปลูกค้าไม่สำเร็จ')}
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
              label="Customer Lifetime (เดือน)"
              hint={
                data.repeatRate != null
                  ? `Repeat Rate ${formatPercent(data.repeatRate)}`
                  : 'ไม่มีลูกค้าปีก่อนสำหรับคำนวณ'
              }
            >
              {data.lifetimeMonths != null
                ? `${formatOptionalNumber(data.lifetimeMonths, {
                    maximumFractionDigits: 1,
                  })} เดือน`
                : '—'}
            </InsightFact>
            <InsightFact
              label="Purchases per Month"
              hint={`หารด้วยลูกค้าทั้งหมด ${data.totalCustomers.toLocaleString('th-TH')} คน`}
            >
              {data.purchasesPerMonth != null
                ? `${formatOptionalNumber(data.purchasesPerMonth, {
                    maximumFractionDigits: 2,
                  })} ครั้ง/เดือน`
                : '—'}
            </InsightFact>
            <InsightFact label="AOV (ยอดต่อออเดอร์)">
              {data.averageOrderValue != null ? formatCurrency(data.averageOrderValue) : '—'}
            </InsightFact>
            <InsightFact label="New Customer (ลูกค้าใหม่)">
              {data.newCustomerCount.toLocaleString('th-TH')} คน
            </InsightFact>
            <InsightFact
              label="Old Customer (ลูกค้าเก่า)"
              hint={
                data.oldCustomerPercent != null
                  ? `${formatPercent(data.oldCustomerPercent)} ของผู้ซื้อเดือนนี้`
                  : undefined
              }
            >
              {data.oldCustomerCount.toLocaleString('th-TH')} คน
            </InsightFact>
          </dl>
        ) : null}
      </CardBody>
    </Card>
  );
}
