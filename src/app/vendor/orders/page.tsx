'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { HiCheckCircle, HiShoppingBag } from 'react-icons/hi2';
import { VendorOrderTrackingLinkDialog } from '@/components/vendor/vendor-order-tracking-link-dialog';
import { VendorOrderWorkflowActionDialog } from '@/components/vendor/vendor-order-workflow-action-dialog';
import {
  VendorOrderFilters,
  type OrderPaymentFilter,
  type OrderQueueView,
  type OrderStatusFilter,
} from '@/components/vendor/vendor-order-filters';
import { VendorOrdersActionMenu } from '@/components/vendor/vendor-orders-action-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { ORDER_STATUSES } from '@/lib/config';
import { labelOrderStatus, labelPaymentMethod } from '@/lib/i18n/th';
import {
  filterVendorActionableOrders,
  isVendorActionableOrder,
  labelVendorWorkflowAction,
} from '@/lib/orders/vendor-action-queue';
import { getVendorOrderWorkflowAction } from '@/lib/orders/workflow';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';

const ALL = 'all';
const SEARCH_DEBOUNCE_MS = 300;
const ORDER_STATUS_SET = new Set<string>(ORDER_STATUSES);
const PAYMENT_METHOD_SET = new Set(['promptpay', 'credit_card', 'cod']);

function buildOrdersQuery(params: { queue?: OrderQueueView; status?: string; payment?: string }) {
  const search = new URLSearchParams();
  if (params.queue === 'action') {
    search.set('queue', 'action');
  } else if (params.queue === 'all') {
    search.set('queue', 'all');
  }
  if (params.status && params.status !== ALL) {
    search.set('status', params.status);
  }
  if (params.payment && params.payment !== ALL) {
    search.set('payment', params.payment);
  }
  const query = search.toString();
  return query ? `/vendor/orders?${query}` : '/vendor/orders';
}

function parseStatusFilter(value: string | null): OrderStatusFilter {
  if (value && ORDER_STATUS_SET.has(value)) {
    return value as OrderStatusFilter;
  }
  return ALL;
}

function parsePaymentFilter(value: string | null): OrderPaymentFilter {
  if (value && PAYMENT_METHOD_SET.has(value)) {
    return value as OrderPaymentFilter;
  }
  return ALL;
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
  hasExtraFilters,
  onClearFilters,
}: {
  queueFilter: boolean;
  hasExtraFilters: boolean;
  onClearFilters: () => void;
}) {
  if (queueFilter && !hasExtraFilters) {
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
        {hasExtraFilters ? 'ไม่พบคำสั่งซื้อตามตัวกรอง' : 'ยังไม่มีคำสั่งซื้อ'}
      </p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {hasExtraFilters
          ? 'ลองเปลี่ยนสถานะ วิธีชำระเงิน หรือคำค้นหา'
          : 'เมื่อมีออเดอร์ใหม่ รายการจะแสดงที่นี่'}
      </p>
      {hasExtraFilters ? (
        <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onClearFilters}>
          ล้างตัวกรอง
        </Button>
      ) : null}
    </div>
  );
}

export default function VendorOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = useVendorStoreId();
  const { data: orders = [], isLoading: ordersLoading, error } = useVendorOrders(storeId);
  // `useVendorOrders` is disabled until `storeId` resolves (auth/vendor store hydration),
  // so its own `isLoading` stays false during that window - without this, the page would
  // briefly render the "no orders" empty state before the real fetch even starts.
  const isLoading = ordersLoading || !storeId;
  const queueParam = searchParams.get('queue');
  const queue: OrderQueueView = queueParam === 'all' ? 'all' : 'action';
  const queueFilter = queue === 'action';
  const statusFilter = parseStatusFilter(searchParams.get('status'));
  const paymentFilter = parsePaymentFilter(searchParams.get('payment'));
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [trackingDialogOrderNumber, setTrackingDialogOrderNumber] = useState<string | null>(null);
  const [workflowOrder, setWorkflowOrder] = useState<Order | null>(null);
  const menuTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (queueParam === null && !searchParams.has('status') && !searchParams.has('payment')) {
      router.replace('/vendor/orders?queue=action', { scroll: false });
    }
  }, [queueParam, router, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const actionableCount = useMemo(
    () => filterVendorActionableOrders(orders, storeId).length,
    [orders, storeId],
  );

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (queueFilter) {
      result = filterVendorActionableOrders(result, storeId);
    }
    if (statusFilter !== ALL) {
      result = result.filter((order) => order.status === statusFilter);
    }
    if (paymentFilter !== ALL) {
      result = result.filter((order) => order.paymentMethod === paymentFilter);
    }
    if (search) {
      const needle = search.toLowerCase();
      result = result.filter((order) => order.orderNumber.toLowerCase().includes(needle));
    }
    return result;
  }, [orders, queueFilter, statusFilter, paymentFilter, search, storeId]);

  function replaceFilters(next: {
    queue: OrderQueueView;
    status: OrderStatusFilter;
    payment: OrderPaymentFilter;
  }) {
    router.replace(
      buildOrdersQuery({
        queue: next.queue,
        status: next.status !== ALL ? next.status : undefined,
        payment: next.payment !== ALL ? next.payment : undefined,
      }),
      { scroll: false },
    );
  }

  function clearExtraFilters() {
    setSearchInput('');
    setSearch('');
    replaceFilters({ queue, status: ALL, payment: ALL });
  }

  const hasExtraFilters = Boolean(search) || statusFilter !== ALL || paymentFilter !== ALL;

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
              type="button"
              size="sm"
              variant="default"
              className="h-8 w-max max-w-none shrink-0 rounded-full px-3.5 text-xs whitespace-nowrap shadow-none"
              aria-haspopup="dialog"
              onClick={(event) => {
                event.stopPropagation();
                setWorkflowOrder(row.original);
              }}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {label}
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
        accessorKey: 'paymentMethod',
        header: 'ชำระเงิน',
        cell: ({ row }) => (
          <span className="text-sm text-ink">{labelPaymentMethod(row.original.paymentMethod)}</span>
        ),
        meta: { className: 'hidden md:table-cell whitespace-nowrap' },
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

      <VendorOrderFilters
        leading={
          <Input
            type="search"
            aria-label="ค้นหาคำสั่งซื้อ"
            placeholder="ค้นหาเลขคำสั่งซื้อ..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        }
        queue={queue}
        actionableCount={actionableCount}
        status={statusFilter}
        paymentMethod={paymentFilter}
        isLoading={isLoading}
        onQueueChange={(nextQueue) =>
          replaceFilters({ queue: nextQueue, status: statusFilter, payment: paymentFilter })
        }
        onStatusChange={(nextStatus) =>
          replaceFilters({ queue, status: nextStatus, payment: paymentFilter })
        }
        onPaymentMethodChange={(nextPayment) =>
          replaceFilters({ queue, status: statusFilter, payment: nextPayment })
        }
        onClearAll={clearExtraFilters}
      />

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
          <OrdersEmptyState
            queueFilter={queueFilter}
            hasExtraFilters={hasExtraFilters}
            onClearFilters={clearExtraFilters}
          />
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

      <VendorOrderWorkflowActionDialog
        order={workflowOrder}
        storeId={storeId}
        open={workflowOrder !== null}
        onOpenChange={(open) => {
          if (!open) setWorkflowOrder(null);
        }}
      />

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
