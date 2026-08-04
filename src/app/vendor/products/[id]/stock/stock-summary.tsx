'use client';

import { LOW_STOCK_THRESHOLD } from './stock-status';

export interface StockSummaryProps {
  variantCount: number;
  totalStock: number;
  lowCount: number;
  outCount: number;
  changedCount: number;
}

function Fact({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string | number;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <dt className="text-sm text-muted-foreground">
        {label}
        {hint ? <span className="mt-0.5 block text-xs">{hint}</span> : null}
      </dt>
      <dd className={valueClassName ?? 'text-sm font-medium tabular-nums text-ink'}>{value}</dd>
    </div>
  );
}

export function StockSummary({
  variantCount,
  totalStock,
  lowCount,
  outCount,
  changedCount,
}: StockSummaryProps) {
  return (
    <section
      aria-label="สรุปสต็อก"
      className="rounded-xl border border-border bg-surface/80 px-5 py-4"
    >
      <h2 className="font-display text-base font-medium text-ink">ภาพรวมคงเหลือ</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        สถานะคำนวณจากจำนวนที่กำลังแก้ — ใกล้หมดเมื่อเหลือไม่เกิน {LOW_STOCK_THRESHOLD} ชิ้น
      </p>
      <dl className="mt-3">
        <Fact label="ตัวเลือก" value={variantCount} />
        <Fact label="สต็อกรวม (ตามค่าที่แก้)" value={totalStock} />
        <Fact
          label="ใกล้หมด"
          value={lowCount}
          valueClassName={
            lowCount > 0
              ? 'text-sm font-medium tabular-nums text-warning-text'
              : 'text-sm font-medium tabular-nums text-ink'
          }
        />
        <Fact
          label="หมดสต็อก"
          value={outCount}
          valueClassName={
            outCount > 0
              ? 'text-sm font-medium tabular-nums text-danger'
              : 'text-sm font-medium tabular-nums text-ink'
          }
        />
        <Fact
          label="รอบันทึก"
          value={changedCount}
          hint={changedCount > 0 ? 'รายการที่จำนวนเปลี่ยนจากของเดิม' : 'ยังไม่มีการเปลี่ยนแปลง'}
        />
      </dl>
    </section>
  );
}
