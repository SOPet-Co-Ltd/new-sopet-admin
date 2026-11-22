'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { labelOrderStatus } from '@/lib/i18n/th';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { AdminCustomerRecentOrder } from '@/types';

const PAGE_SIZE = 10;

type OrderHistoryRow = {
  id: string;
  orderNumber: string;
  status: string;
  productSummary: string;
  total: number;
  createdAt: string;
};

type AdminCustomerOrderHistoryProps = {
  orders: AdminCustomerRecentOrder[];
  title?: string;
  description?: string;
  emptyMessage?: string;
};

function buildProductSummary(items: AdminCustomerRecentOrder['items']): string {
  if (items.length === 0) return '—';
  const first = items[0].productName;
  if (items.length === 1) return first;
  return `${first} และอีก ${items.length - 1} รายการ`;
}

export function AdminCustomerOrderHistory({
  orders,
  title = 'ประวัติการสั่งซื้อ',
  description = 'แสดงทีละ 10 รายการ ค้นหาได้จากเลขคำสั่งซื้อ',
  emptyMessage = 'ยังไม่มีประวัติการสั่งซื้อ',
}: AdminCustomerOrderHistoryProps) {
  const [orderNumberQuery, setOrderNumberQuery] = useState('');
  const [page, setPage] = useState(1);
  const normalizedQuery = orderNumberQuery.trim().toLowerCase();

  const rows = useMemo<OrderHistoryRow[]>(() => {
    const mapped = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      productSummary: buildProductSummary(order.items),
      total: order.total,
      createdAt: order.createdAt,
    }));
    if (!normalizedQuery) return mapped;
    return mapped.filter((order) => order.orderNumber.toLowerCase().includes(normalizedQuery));
  }, [normalizedQuery, orders]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns = useMemo<ColumnDef<OrderHistoryRow>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'เลขคำสั่งซื้อ',
        cell: ({ row }) => (
          <span className="font-medium whitespace-nowrap text-ink">{row.original.orderNumber}</span>
        ),
        meta: { className: 'whitespace-nowrap' },
      },
      {
        accessorKey: 'productSummary',
        header: 'สินค้า',
        cell: ({ row }) => (
          <span
            className="line-clamp-2 max-w-[18rem] break-words text-ink"
            title={row.original.productSummary}
          >
            {row.original.productSummary}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.status}>{labelOrderStatus(row.original.status)}</Badge>
        ),
      },
      {
        accessorKey: 'total',
        header: 'ยอดรวม',
        cell: ({ row }) => formatCurrency(row.original.total),
        meta: { className: 'text-right' },
      },
      {
        accessorKey: 'createdAt',
        header: 'วันที่สั่งซื้อ',
        cell: ({ row }) => formatDateTime(row.original.createdAt),
        meta: { className: 'hidden md:table-cell' },
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold text-balance text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          type="search"
          aria-label="กรองเลขคำสั่งซื้อ"
          placeholder="กรองเลขคำสั่งซื้อ"
          value={orderNumberQuery}
          onChange={(event) => {
            setOrderNumberQuery(event.target.value);
            setPage(1);
          }}
        />
        <DataTable
          columns={columns}
          data={pageRows}
          emptyMessage={normalizedQuery ? 'ไม่พบคำสั่งซื้อเลขนี้' : emptyMessage}
        />
        {rows.length > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="tabular-nums">
              ทั้งหมด {rows.length.toLocaleString('th-TH')} รายการ
              {totalPages > 1 ? ` · หน้า ${currentPage} จาก ${totalPages}` : ''}
            </span>
            {totalPages > 1 ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  ถัดไป
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
