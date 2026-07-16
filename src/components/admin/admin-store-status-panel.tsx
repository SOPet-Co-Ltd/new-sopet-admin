'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { labelStoreStatus } from '@/lib/i18n/th';
import type { StoreStatus } from '@/types';

type AdminStoreStatusPanelProps = {
  status: StoreStatus | string;
  isPending: boolean;
  onStatusChange: (status: StoreStatus) => void;
  statusMessage?: string | null;
};

const panelCopy: Record<
  string,
  { title: string; description: string; cardClass: string; titleClass: string }
> = {
  pending: {
    title: 'ร้านค้ารออนุมัติ',
    description:
      'ตรวจสอบข้อมูลร้านและเจ้าของก่อนตัดสินใจ — การอนุมัติจะเปิดให้ร้านขายสินค้าได้ทันที',
    cardClass: 'border-warning-bg bg-warning-bg/40',
    titleClass: 'text-warning-text',
  },
  suspended: {
    title: 'ร้านค้าถูกระงับ',
    description:
      'ร้านไม่สามารถรับคำสั่งซื้อได้ ผู้ขายอาจยื่นคำขอเปิดใช้งานผ่านระบบ — แอดมินสามารถเปิดใช้งานได้โดยตรง',
    cardClass: 'border-danger-bg bg-danger-bg/30',
    titleClass: 'text-danger',
  },
  rejected: {
    title: 'ร้านค้าถูกปฏิเสธ',
    description: 'ร้านไม่ได้รับการอนุมัติ หากข้อมูลครบถ้วนแล้วสามารถอนุมัติใหม่ได้',
    cardClass: 'border-border bg-surface',
    titleClass: 'text-ink',
  },
};

export function AdminStoreStatusPanel({
  status,
  isPending,
  onStatusChange,
  statusMessage,
}: AdminStoreStatusPanelProps) {
  if (status === 'approved') return null;

  const copy = panelCopy[status];
  if (!copy) return null;

  return (
    <Card className={copy.cardClass}>
      <CardBody className="space-y-4">
        <div>
          <h2 className={`font-display text-base font-semibold ${copy.titleClass}`}>
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            สถานะปัจจุบัน: <span className="font-medium text-ink">{labelStoreStatus(status)}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {status === 'pending' ? (
            <>
              <Button
                type="button"
                disabled={isPending}
                aria-busy={isPending}
                onClick={() => onStatusChange('approved')}
              >
                {isPending ? 'กำลังดำเนินการ...' : 'อนุมัติเปิดใช้งาน'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => onStatusChange('rejected')}
              >
                ปฏิเสธร้านค้า
              </Button>
            </>
          ) : null}

          {status === 'suspended' ? (
            <>
              <Button
                type="button"
                disabled={isPending}
                aria-busy={isPending}
                onClick={() => onStatusChange('approved')}
              >
                {isPending ? 'กำลังดำเนินการ...' : 'เปิดใช้งานอีกครั้ง'}
              </Button>
              <Button type="button" variant="outline" className="bg-card" asChild>
                <Link href="/admin/reactivation-requests">ดูคำขอเปิดใช้งาน</Link>
              </Button>
            </>
          ) : null}

          {status === 'rejected' ? (
            <Button
              type="button"
              disabled={isPending}
              aria-busy={isPending}
              onClick={() => onStatusChange('approved')}
            >
              {isPending ? 'กำลังดำเนินการ...' : 'อนุมัติใหม่'}
            </Button>
          ) : null}
        </div>

        {statusMessage ? (
          <p className="text-sm text-muted-foreground" role="status">
            {statusMessage}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

type AdminStoreStatusActionsProps = {
  status: StoreStatus | string;
  isPending: boolean;
  onStatusChange: (status: StoreStatus) => void;
};

export function AdminStoreStatusActions({
  status,
  isPending,
  onStatusChange,
}: AdminStoreStatusActionsProps) {
  if (status !== 'approved') return null;

  return (
    <Button
      type="button"
      variant="destructive"
      className="w-full"
      disabled={isPending}
      aria-busy={isPending}
      onClick={() => onStatusChange('suspended')}
    >
      {isPending ? 'กำลังดำเนินการ...' : 'ระงับร้านค้า'}
    </Button>
  );
}
