'use client';

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import type { AdminOrder } from '@/lib/api/admin-orders';
import { getErrorMessage } from '@/lib/api/errors';
import { ORDER_STATUSES } from '@/lib/config';
import { labelOrderStatus, labelPaymentMethod } from '@/lib/i18n/th';
import {
  parseEnumParam,
  parsePageParam,
  parseSearchQuery,
  serializeEnumParam,
  serializePageParam,
  serializeSearchQuery,
} from '@/lib/navigation/list-query-params';
import { useDebouncedSearchDraft } from '@/lib/navigation/use-debounced-search-draft';
import { useListQueryState, type ListQuerySpec } from '@/lib/navigation/use-list-query-state';
import { getOrderCustomerName } from '@/lib/orders/display';
import { cn, formatCurrency, formatDateTime } from '@/lib/utils';

const SEARCH_DEBOUNCE_MS = 300;
const ALL = 'all';

const ADMIN_ORDER_STATUS_VALUES = [ALL, ...ORDER_STATUSES, 'on_hold'] as const;
type AdminOrderStatusFilter = (typeof ADMIN_ORDER_STATUS_VALUES)[number];

const adminOrdersQuerySpec = {
  page: { parse: parsePageParam, serialize: serializePageParam },
  q: { parse: parseSearchQuery, serialize: serializeSearchQuery },
  status: {
    parse: (raw: string | null) =>
      parseEnumParam(raw, ADMIN_ORDER_STATUS_VALUES, ALL) as AdminOrderStatusFilter,
    serialize: (value: AdminOrderStatusFilter) => serializeEnumParam(value, ALL),
  },
} satisfies ListQuerySpec;

function OrdersTableSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="กำลังโหลดคำสั่งซื้อ">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-xl bg-brand-tint motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [params, setParams] = useListQueryState(adminOrdersQuerySpec);
  const { page, q: search, status: statusFilter } = params;

  const commitSearch = useCallback((next: string) => setParams({ q: next, page: 1 }), [setParams]);
  const [searchInput, setSearchInput] = useDebouncedSearchDraft(
    search,
    commitSearch,
    SEARCH_DEBOUNCE_MS,
  );

  const { data, isLoading, isFetching, error } = useAdminOrders({
    page,
    search: search || undefined,
    status: statusFilter === ALL ? undefined : statusFilter,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const hasFilters = Boolean(search) || statusFilter !== ALL;

  const columns = useMemo<ColumnDef<AdminOrder>[]>(
    () => [
      {
        id: 'orderNumber',
        accessorFn: (row) => row.order.orderNumber,
        header: ({ column }) => <SortableHeader column={column}>คำสั่งซื้อ</SortableHeader>,
        cell: ({ row }) => (
          <span className="font-medium whitespace-nowrap text-ink">
            {row.original.order.orderNumber}
          </span>
        ),
        meta: { className: 'whitespace-nowrap' },
      },
      {
        id: 'createdAt',
        accessorFn: (row) => row.order.createdAt,
        header: ({ column }) => <SortableHeader column={column}>เวลาสั่งซื้อ</SortableHeader>,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
            {formatDateTime(row.original.order.createdAt)}
          </span>
        ),
        meta: { className: 'whitespace-nowrap' },
      },
      {
        id: 'customer',
        header: 'ลูกค้า',
        cell: ({ row }) => {
          const { order, customer } = row.original;
          const name = customer?.fullName || getOrderCustomerName(order);
          const phone = customer?.phone || order.guestPhone || order.shippingAddress?.phone;

          return (
            <div
              className="min-w-0"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              {customer ? (
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="block truncate font-medium text-brand underline-offset-2 hover:underline"
                >
                  {name}
                </Link>
              ) : (
                <p className="truncate font-medium text-ink">{name}</p>
              )}
              {phone ? <p className="truncate text-xs text-muted-foreground">{phone}</p> : null}
            </div>
          );
        },
      },
      {
        id: 'stores',
        header: 'ร้านค้า',
        cell: ({ row }) => (
          <div
            className="flex max-w-[16rem] flex-wrap gap-x-2 gap-y-1"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {row.original.stores.length === 0 ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              row.original.stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/admin/stores/${store.id}`}
                  className="text-sm text-brand underline-offset-2 hover:underline"
                >
                  {store.name || store.id}
                </Link>
              ))
            )}
          </div>
        ),
        meta: { className: 'hidden min-w-[12rem] md:table-cell' },
      },
      {
        id: 'status',
        accessorFn: (row) => row.order.status,
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.order.status}>
            {labelOrderStatus(row.original.order.status)}
          </Badge>
        ),
        meta: { className: 'whitespace-nowrap' },
      },
      {
        id: 'paymentMethod',
        accessorFn: (row) => row.order.paymentMethod,
        header: 'ชำระเงิน',
        cell: ({ row }) => (
          <span className="text-sm text-ink">
            {labelPaymentMethod(row.original.order.paymentMethod)}
          </span>
        ),
        meta: { className: 'hidden lg:table-cell whitespace-nowrap' },
      },
      {
        id: 'total',
        accessorFn: (row) => row.order.total,
        header: ({ column }) => <SortableHeader column={column}>ยอดรวม</SortableHeader>,
        cell: ({ row }) => (
          <span className="tabular-nums text-ink">{formatCurrency(row.original.order.total)}</span>
        ),
        meta: { className: 'text-right', headerClassName: 'text-right' },
      },
    ],
    [],
  );

  const resultLabel = useMemo(() => {
    if (!pagination) return null;
    const totalLabel = pagination.total.toLocaleString('th-TH');
    if (hasFilters) {
      return `พบ ${totalLabel} รายการ`;
    }
    if (pagination.totalPages > 1) {
      return `หน้า ${pagination.page} จาก ${pagination.totalPages} · ทั้งหมด ${totalLabel} รายการ`;
    }
    return `คำสั่งซื้อทั้งหมด ${totalLabel} รายการ`;
  }, [hasFilters, pagination]);

  function clearFilters() {
    setSearchInput('');
    setParams({ q: '', status: ALL, page: 1 });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="คำสั่งซื้อ"
        description="ดูคำสั่งซื้อทั้งหมดจากทุกผู้ขาย — ดูได้อย่างเดียว ไม่สามารถแก้ไขได้"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          aria-label="ค้นหาเลขคำสั่งซื้อ"
          placeholder="ค้นหาเลขคำสั่งซื้อ..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="max-w-md"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setParams({ status: value as AdminOrderStatusFilter, page: 1 })}
        >
          <SelectTrigger aria-label="กรองตามสถานะ" className="w-full sm:w-48">
            <SelectValue placeholder="ทุกสถานะ" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_ORDER_STATUS_VALUES.map((status) => (
              <SelectItem key={status} value={status}>
                {status === ALL ? 'ทุกสถานะ' : labelOrderStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            ล้างตัวกรอง
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {getErrorMessage(error, 'โหลดคำสั่งซื้อไม่สำเร็จ')}
        </p>
      ) : null}

      <div
        className={cn('space-y-3', isFetching && !isLoading ? 'opacity-80' : undefined)}
        aria-busy={isFetching || undefined}
      >
        {isLoading ? <OrdersTableSkeleton /> : null}

        {!isLoading && !error && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {hasFilters ? 'ไม่พบคำสั่งซื้อตามตัวกรอง' : 'ยังไม่มีคำสั่งซื้อ'}
          </p>
        ) : null}

        {!isLoading && !error && items.length > 0 ? (
          <>
            {resultLabel ? (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {resultLabel}
              </p>
            ) : null}

            <DataTable
              columns={columns}
              data={items}
              emptyMessage="ไม่พบคำสั่งซื้อ"
              onRowClick={(row) => router.push(`/admin/orders/${row.order.id}`)}
            />

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-muted-foreground">
                <span className="tabular-nums">
                  หน้า {pagination.page} จาก {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setParams((current) => ({ page: current.page - 1 }))}
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages || isFetching}
                    onClick={() => setParams((current) => ({ page: current.page + 1 }))}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
