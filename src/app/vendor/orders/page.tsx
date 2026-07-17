'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect, type KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { HiCheckCircle, HiShoppingBag } from 'react-icons/hi2';
import { VendorOrderTrackingLinkDialog } from '@/components/vendor/vendor-order-tracking-link-dialog';
import { VendorOrdersActionMenu } from '@/components/vendor/vendor-orders-action-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { ORDER_STATUSES } from '@/lib/config';
import { labelOrderStatus } from '@/lib/i18n/th';
import {
  filterVendorActionableOrders,
  isVendorActionableOrder,
  labelVendorWorkflowAction,
} from '@/lib/orders/vendor-action-queue';
import { getVendorOrderWorkflowAction } from '@/lib/orders/workflow';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';

function buildOrdersQuery(params: { queue?: 'action' | 'all'; status?: string }) {
  const search = new URLSearchParams();
  if (params.queue === 'action') {
    search.set('queue', 'action');
  } else if (params.queue === 'all') {
    search.set('queue', 'all');
  }
  if (params.status && params.status !== 'all') {
    search.set('status', params.status);
  }
  const query = search.toString();
  return query ? `/vendor/orders?${query}` : '/vendor/orders';
}

function OrdersTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]"
      aria-busy="true"
      aria-label="กำลังโหลดคำสั่งซื้อ"
    >
      <div className="border-b border-border bg-surface/60 px-4 py-3">
        <div className="flex gap-8">
          <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          <div className="h-4 w-28 animate-pulse rounded bg-surface" />
          <div className="hidden h-4 w-16 animate-pulse rounded bg-surface sm:block" />
          <div className="ml-auto hidden h-4 w-16 animate-pulse rounded bg-surface sm:block" />
        </div>
      </div>
      <ul className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="flex items-center gap-4 px-4 py-3.5">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-40 max-w-full animate-pulse rounded bg-surface" />
              <div className="h-3 w-28 max-w-full animate-pulse rounded bg-surface" />
            </div>
            <div className="h-8 w-28 shrink-0 animate-pulse rounded-md bg-primary-tint" />
            <div className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-surface" />
            <div className="hidden h-4 w-16 shrink-0 animate-pulse rounded bg-surface sm:block" />
            <div className="size-10 shrink-0 animate-pulse rounded-lg bg-surface" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrdersEmptyState({
  queueFilter,
  statusFilter,
}: {
  queueFilter: boolean;
  statusFilter: string;
}) {
  const hasStatusFilter = statusFilter !== 'all';

  if (queueFilter && !hasStatusFilter) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-success/20 bg-success-bg/30 px-6 py-14 text-center">
        <div
          className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success"
          aria-hidden="true"
        >
          <HiCheckCircle className="size-6" />
        </div>
        <p className="mt-4 font-medium text-ink">ไม่มีออเดอร์ที่ต้องดำเนินการ</p>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          คิวว่างแล้ว — ออเดอร์ใหม่จะปรากฏที่นี่เมื่อลูกค้าชำระเงิน
        </p>
        <Button variant="outline" size="sm" asChild className="mt-5">
          <Link href="/vendor/orders?queue=all">ดูคำสั่งซื้อทั้งหมด</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground"
        aria-hidden="true"
      >
        <HiShoppingBag className="size-6" />
      </div>
      <p className="mt-4 font-medium text-ink">
        {hasStatusFilter ? 'ไม่พบคำสั่งซื้อตามตัวกรอง' : 'ยังไม่มีคำสั่งซื้อ'}
      </p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {hasStatusFilter
          ? 'ลองเปลี่ยนสถานะหรือสลับไปคิวที่ต้องทำ'
          : 'เมื่อมีออเดอร์ใหม่ รายการจะแสดงที่นี่'}
      </p>
      {hasStatusFilter ? (
        <Button variant="outline" size="sm" asChild className="mt-5">
          <Link href={queueFilter ? '/vendor/orders?queue=action' : '/vendor/orders?queue=all'}>
            ล้างตัวกรองสถานะ
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export default function VendorOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = useVendorStoreId();
  const { data: orders = [], isLoading, error } = useVendorOrders(storeId);
  const queueParam = searchParams.get('queue');
  const queueFilter = queueParam !== 'all';
  const statusFilter = searchParams.get('status') ?? 'all';
  const [trackingDialogOrderNumber, setTrackingDialogOrderNumber] = useState<string | null>(null);
  const menuTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (queueParam === null && !searchParams.has('status')) {
      router.replace('/vendor/orders?queue=action', { scroll: false });
    }
  }, [queueParam, router, searchParams]);

  const actionableCount = useMemo(
    () => filterVendorActionableOrders(orders, storeId).length,
    [orders, storeId],
  );

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (queueFilter) {
      result = filterVendorActionableOrders(result, storeId);
    }
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }
    return result;
  }, [orders, queueFilter, statusFilter, storeId]);

  function setQueueView(nextQueue: 'action' | 'all') {
    router.replace(
      buildOrdersQuery({
        queue: nextQueue,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
      { scroll: false },
    );
  }

  function setStatusFilter(value: string) {
    router.replace(
      buildOrdersQuery({
        queue: queueFilter ? 'action' : 'all',
        status: value !== 'all' ? value : undefined,
      }),
      { scroll: false },
    );
  }

  function onQueueTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }
    event.preventDefault();
    const next: 'action' | 'all' =
      event.key === 'Home' || event.key === 'ArrowLeft' ? 'action' : 'all';
    setQueueView(next);
    requestAnimationFrame(() => {
      document.getElementById(next === 'action' ? 'orders-tab-action' : 'orders-tab-all')?.focus();
    });
  }

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => <SortableHeader column={column}>คำสั่งซื้อ</SortableHeader>,
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            <p className="font-medium whitespace-nowrap text-ink">{row.original.orderNumber}</p>
            <p className="text-xs whitespace-nowrap text-muted-foreground">
              {formatDateTime(row.original.createdAt)}
            </p>
          </div>
        ),
        meta: { className: 'whitespace-nowrap' },
      },
      {
        id: 'nextAction',
        header: 'ขั้นตอนถัดไป',
        cell: ({ row }) => {
          const action = getVendorOrderWorkflowAction(row.original, storeId);
          const actionable = isVendorActionableOrder(row.original, storeId);
          const label = labelVendorWorkflowAction(action);

          if (!actionable) {
            return <span className="text-sm whitespace-nowrap text-muted-foreground">{label}</span>;
          }

          return (
            <Button
              size="sm"
              variant="default"
              asChild
              className="h-8 w-max max-w-none shrink-0 rounded-full px-3.5 text-xs whitespace-nowrap shadow-none"
            >
              <Link href={`/vendor/orders/${row.original.id}`}>{label}</Link>
            </Button>
          );
        },
        meta: { className: 'whitespace-nowrap' },
      },
      {
        accessorKey: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.status}>{labelOrderStatus(row.original.status)}</Badge>
        ),
        meta: { className: 'whitespace-nowrap' },
      },
      {
        accessorKey: 'total',
        header: ({ column }) => <SortableHeader column={column}>ยอดรวม</SortableHeader>,
        cell: ({ row }) => (
          <span className="tabular-nums text-ink">{formatCurrency(row.original.total)}</span>
        ),
        meta: { className: 'hidden sm:table-cell text-right', headerClassName: 'text-right' },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <VendorOrdersActionMenu
            orderId={row.original.id}
            orderNumber={row.original.orderNumber}
            onViewDetails={(orderId) => router.push(`/vendor/orders/${orderId}`)}
            onCopyTrackingLink={setTrackingDialogOrderNumber}
            menuTriggerRef={menuTriggerRef}
          />
        ),
        meta: { className: 'w-12' },
      },
    ],
    [router, storeId],
  );

  const resultLabel = useMemo(() => {
    const count = filteredOrders.length.toLocaleString('th-TH');
    if (queueFilter) {
      return `${count} รายการที่ต้องดำเนินการ`;
    }
    return `${count} รายการ`;
  }, [filteredOrders.length, queueFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="คำสั่งซื้อ"
        description={
          queueFilter
            ? 'คิวออเดอร์ที่ต้องดำเนินการ — เรียงจากเก่าที่สุด'
            : 'ดูและดำเนินการคำสั่งซื้อจากลูกค้า'
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="มุมมองคำสั่งซื้อ">
          <Button
            type="button"
            id="orders-tab-action"
            role="tab"
            aria-selected={queueFilter}
            aria-controls="orders-panel"
            tabIndex={queueFilter ? 0 : -1}
            variant={queueFilter ? 'default' : 'outline'}
            className={cn(
              'rounded-full',
              queueFilter ? 'shadow-none' : 'bg-card text-ink hover:bg-surface',
            )}
            onClick={() => setQueueView('action')}
            onKeyDown={onQueueTabKeyDown}
          >
            ต้องทำ
            {!isLoading && actionableCount > 0 ? (
              <span
                className={cn(
                  'ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums',
                  queueFilter ? 'bg-white/20 text-white' : 'bg-secondary-tint text-secondary',
                )}
              >
                {actionableCount.toLocaleString('th-TH')}
              </span>
            ) : null}
          </Button>
          <Button
            type="button"
            id="orders-tab-all"
            role="tab"
            aria-selected={!queueFilter}
            aria-controls="orders-panel"
            tabIndex={!queueFilter ? 0 : -1}
            variant={!queueFilter ? 'default' : 'outline'}
            className={cn(
              'rounded-full',
              !queueFilter ? 'shadow-none' : 'bg-card text-ink hover:bg-surface',
            )}
            onClick={() => setQueueView('all')}
            onKeyDown={onQueueTabKeyDown}
          >
            ทั้งหมด
          </Button>
        </div>

        <div className="w-full sm:w-52">
          <label
            htmlFor="orders-status-filter"
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            กรองตามสถานะ
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="orders-status-filter" className="bg-card">
              <SelectValue placeholder="ทุกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {labelOrderStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'โหลดคำสั่งซื้อไม่สำเร็จ'}
        </p>
      ) : null}

      <div
        id="orders-panel"
        role="tabpanel"
        aria-labelledby={queueFilter ? 'orders-tab-action' : 'orders-tab-all'}
        className="space-y-3"
      >
        {isLoading ? <OrdersTableSkeleton /> : null}

        {!isLoading && filteredOrders.length === 0 ? (
          <OrdersEmptyState queueFilter={queueFilter} statusFilter={statusFilter} />
        ) : null}

        {!isLoading && filteredOrders.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {resultLabel}
            </p>
            <DataTable
              columns={columns}
              data={filteredOrders}
              emptyMessage={queueFilter ? 'ไม่มีออเดอร์ที่ต้องดำเนินการ' : 'ไม่พบคำสั่งซื้อ'}
              onRowClick={(order) => router.push(`/vendor/orders/${order.id}`)}
            />
          </>
        ) : null}
      </div>

      <VendorOrderTrackingLinkDialog
        orderNumber={trackingDialogOrderNumber ?? ''}
        open={trackingDialogOrderNumber !== null}
        onOpenChange={(open) => {
          if (!open) setTrackingDialogOrderNumber(null);
        }}
        menuTriggerRef={menuTriggerRef}
      />
    </div>
  );
}
