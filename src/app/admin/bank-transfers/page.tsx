'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  useConfirmBankTransferPaid,
  usePendingBankTransferOrders,
} from '@/hooks/useAdminBankTransfers';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMoney(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminBankTransfersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = usePendingBankTransferOrders(page);
  const confirmMutation = useConfirmBankTransferPaid();

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const busyId = confirmMutation.isPending ? confirmMutation.variables?.orderId : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="โอนเงินเข้าบัญชี"
        description="ตรวจสอบยอดโอนเข้าบัญชี SOPET แล้วกดยืนยันรับเงิน — ร้านค้าไม่สามารถบังคับชำระสำเร็จได้"
      />

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">
            รอตรวจสอบ
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
            <p className="text-sm text-muted">ไม่มีคำสั่งซื้อรอโอนเงิน</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((order) => {
                const customerLabel =
                  order.guestName || order.guestPhone || order.guestEmail || 'ลูกค้า';
                const itemSummary = order.items
                  .slice(0, 2)
                  .map((item) => `${item.productName} ×${item.quantity}`)
                  .join(' · ');
                return (
                  <li
                    key={order.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1 text-sm">
                      <p className="font-medium text-ink">{order.orderNumber}</p>
                      <p className="text-muted">
                        {customerLabel} · {formatDate(order.createdAt)}
                      </p>
                      <p className="font-medium tabular-nums text-ink">
                        {formatMoney(order.total)}
                      </p>
                      {itemSummary ? <p className="text-muted">{itemSummary}</p> : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() =>
                          confirmMutation.mutate({
                            orderId: order.id,
                            note: 'ยืนยันจากหน้าแอดมิน',
                          })
                        }
                      >
                        {busyId === order.id ? 'กำลังยืนยัน...' : 'ยืนยันรับเงินแล้ว'}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

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
