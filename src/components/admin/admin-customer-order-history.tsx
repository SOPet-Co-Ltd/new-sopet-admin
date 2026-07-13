'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { labelOrderStatus } from '@/lib/i18n/th';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { AdminCustomerRecentOrder } from '@/types';

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
  title = 'ประวัติการสั่งซื้อล่าสุด',
  description = 'แสดงคำสั่งซื้อ 10 รายการล่าสุด',
  emptyMessage = 'ยังไม่มีประวัติการสั่งซื้อ',
}: AdminCustomerOrderHistoryProps) {
  const rows = useMemo<OrderHistoryRow[]>(
    () =>
      orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        productSummary: buildProductSummary(order.items),
        total: order.total,
        createdAt: order.createdAt,
      })),
    [orders],
  );

  const columns = useMemo<ColumnDef<OrderHistoryRow>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'เลขคำสั่งซื้อ',
        cell: ({ row }) => <span className="font-medium text-ink">{row.original.orderNumber}</span>,
      },
      {
        accessorKey: 'productSummary',
        header: 'สินค้า',
        cell: ({ row }) => row.original.productSummary,
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
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </CardHeader>
      <CardBody>
        <DataTable columns={columns} data={rows} emptyMessage={emptyMessage} />
      </CardBody>
    </Card>
  );
}
