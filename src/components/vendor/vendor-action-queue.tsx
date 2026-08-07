'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HiArrowRight, HiCheckCircle, HiShoppingBag } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { VendorOrderWorkflowActionDialog } from '@/components/vendor/vendor-order-workflow-action-dialog';
import {
  filterVendorActionableOrders,
  labelVendorWorkflowAction,
} from '@/lib/orders/vendor-action-queue';
import { getVendorOrderWorkflowAction } from '@/lib/orders/workflow';
import { labelOrderStatus } from '@/lib/i18n/th';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';

const PREVIEW_LIMIT = 5;

export function VendorActionQueue({ orders, storeId }: { orders: Order[]; storeId: string }) {
  const [workflowOrder, setWorkflowOrder] = useState<Order | null>(null);
  const actionable = filterVendorActionableOrders(orders, storeId);
  const preview = actionable.slice(0, PREVIEW_LIMIT);
  const remaining = actionable.length - preview.length;

  if (actionable.length === 0) {
    return (
      <Card className="border-success/20 bg-success-bg/30 shadow-none">
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
              aria-hidden="true"
            >
              <HiCheckCircle className="size-5" />
            </div>
            <div>
              <p className="font-medium text-ink">ไม่มีออเดอร์ที่ต้องทำตอนนี้</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                ออเดอร์ใหม่จะแสดงที่นี่ทันทีเมื่อลูกค้าชำระเงิน
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 rounded-full">
            <Link href="/vendor/orders?queue=all">ดูคำสั่งซื้อทั้งหมด</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <section aria-labelledby="vendor-action-queue-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="vendor-action-queue-heading"
            className="text-lg font-medium text-ink text-balance"
          >
            ออเดอร์ที่ต้องทำ
          </h2>
          <p className="text-sm text-muted-foreground">
            {actionable.length.toLocaleString('th-TH')} รายการรอดำเนินการ — เรียงจากเก่าที่สุด
          </p>
        </div>
        <Button size="sm" asChild className="rounded-full shadow-none">
          <Link href="/vendor/orders?queue=action">
            ดูทั้งหมด
            <HiArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <ul className="space-y-2">
        {preview.map((order) => {
          const action = getVendorOrderWorkflowAction(order, storeId);
          const label = labelVendorWorkflowAction(action);
          return (
            <li key={order.id}>
              <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card px-4 py-3 transition-colors duration-150 hover:border-border hover:bg-surface/80 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/vendor/orders/${order.id}`}
                  className="flex min-w-0 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <div
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted-foreground"
                    aria-hidden="true"
                  >
                    <HiShoppingBag className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium whitespace-nowrap text-ink">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge status={order.status}>{labelOrderStatus(order.status)}</Badge>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full px-3 text-xs shadow-none"
                    aria-haspopup="dialog"
                    onClick={() => setWorkflowOrder(order)}
                  >
                    {label}
                  </Button>
                  <span className="text-sm font-medium tabular-nums text-ink">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {remaining > 0 ? (
        <p className="text-sm text-muted-foreground">
          และอีก {remaining.toLocaleString('th-TH')} รายการ —{' '}
          <Link
            href="/vendor/orders?queue=action"
            className="font-medium text-secondary underline-offset-2 hover:underline"
          >
            ดูคิวทั้งหมด
          </Link>
        </p>
      ) : null}

      <VendorOrderWorkflowActionDialog
        order={workflowOrder}
        storeId={storeId}
        open={workflowOrder !== null}
        onOpenChange={(open) => {
          if (!open) setWorkflowOrder(null);
        }}
      />
    </section>
  );
}
