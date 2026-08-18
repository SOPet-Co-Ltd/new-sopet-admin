'use client';

import { cn, formatDateTime } from '@/lib/utils';
import { labelPaymentMethod } from '@/lib/i18n/th';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { useOrderAuditLog } from '@/hooks/useOrderAuditLog';
import type { OrderAuditActorType, OrderAuditEventType, OrderAuditLogEntry } from '@/types';

const EVENT_TITLES: Record<OrderAuditEventType, string> = {
  ORDER_PLACED: 'ลูกค้าสร้างคำสั่งซื้อ',
  PAYMENT_METHOD_CHANGED: 'ลูกค้าเปลี่ยนวิธีชำระเงิน',
  PAYMENT_APPROVED: 'อนุมัติการชำระเงิน',
  ORDER_ACCEPTED: 'ร้านค้ารับคำสั่งซื้อ',
};

function actorLine(entry: OrderAuditLogEntry): string {
  const label = entry.actorLabel?.trim();
  switch (entry.actorType as OrderAuditActorType) {
    case 'customer':
      return label ? `ลูกค้า · ${label}` : 'ลูกค้า';
    case 'admin':
      return label || 'ผู้ดูแลระบบ SOPET';
    case 'vendor':
      return label ? `ร้านค้า · ${label}` : 'ร้านค้า';
    case 'system':
      return 'ระบบ';
    default:
      return label || '—';
  }
}

function detailsLine(entry: OrderAuditLogEntry): string | null {
  const details = entry.details ?? {};
  switch (entry.eventType) {
    case 'ORDER_PLACED':
      return details.paymentMethod
        ? `วิธีชำระเงิน: ${labelPaymentMethod(details.paymentMethod)}`
        : null;
    case 'PAYMENT_METHOD_CHANGED':
      if (!details.previousPaymentMethod || !details.newPaymentMethod) {
        return null;
      }
      return `${labelPaymentMethod(details.previousPaymentMethod)} → ${labelPaymentMethod(details.newPaymentMethod)}`;
    case 'PAYMENT_APPROVED':
      return details.approvalMethod === 'manual_bank_transfer'
        ? 'โอนเงินเข้าบัญชี (ยืนยันด้วยตนเอง)'
        : null;
    case 'ORDER_ACCEPTED':
      return null;
    default:
      return null;
  }
}

function eventTitle(eventType: string): string {
  return EVENT_TITLES[eventType as OrderAuditEventType] ?? 'เหตุการณ์คำสั่งซื้อ';
}

type VendorOrderAuditLogProps = {
  orderId: string;
  storeId?: string;
};

export function VendorOrderAuditLog({ orderId, storeId }: VendorOrderAuditLogProps) {
  const { data, isLoading, error, refetch, isFetching } = useOrderAuditLog(orderId, storeId);
  const entries = data?.entries ?? [];

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold text-ink">ประวัติคำสั่งซื้อ</h2>
        <p className="mt-1 text-sm text-muted">เหตุการณ์ของคำสั่งซื้อนี้เรียงตามเวลา</p>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดประวัติคำสั่งซื้อ">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-md bg-brand-tint motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-danger" role="alert">
              โหลดประวัติคำสั่งซื้อไม่สำเร็จ
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              ลองอีกครั้ง
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มีประวัติคำสั่งซื้อ</p>
        ) : (
          <ol className="space-y-0" aria-label="ประวัติคำสั่งซื้อ">
            {entries.map((entry, index) => {
              const extra = detailsLine(entry);
              const isLast = index === entries.length - 1;
              return (
                <li key={entry.id} className="flex gap-3">
                  <div className="flex w-4 shrink-0 flex-col items-center">
                    <span className="mt-1.5 size-2 rounded-full bg-brand" aria-hidden="true" />
                    {isLast ? null : <span className="w-px flex-1 bg-border" aria-hidden="true" />}
                  </div>
                  <div className={cn('min-w-0 pb-4', isLast && 'pb-0')}>
                    <p className="text-sm font-medium break-words text-ink">
                      {eventTitle(entry.eventType)}
                    </p>
                    <p className="text-sm break-words text-muted">{actorLine(entry)}</p>
                    {extra ? <p className="text-sm break-words text-ink">{extra}</p> : null}
                    <p className="text-xs tabular-nums text-muted">
                      {formatDateTime(entry.occurredAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
