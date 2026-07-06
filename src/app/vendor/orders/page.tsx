'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateOrderStatus } from '@/hooks/useUpdateOrderStatus';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { ORDER_STATUSES } from '@/lib/config';
import { labelOrderStatus } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

export default function VendorOrdersPage() {
  const { data: orders = [], isLoading, error } = useVendorOrders();
  const statusMutation = useUpdateOrderStatus();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: 'customer',
        header: 'ลูกค้า',
        cell: ({ row }) => {
          const order = row.original;
          if (order.guestPhone) {
            return (
              <div className="text-sm">
                <p className="font-medium text-ink">{order.guestName ?? 'ลูกค้าทั่วไป'}</p>
                <p className="text-muted">{order.guestPhone}</p>
              </div>
            );
          }
          return <span className="text-muted">สมาชิก</span>;
        },
      },
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => <SortableHeader column={column}>คำสั่งซื้อ</SortableHeader>,
        cell: ({ row }) => <span className="font-medium text-ink">{row.original.orderNumber}</span>,
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
        header: ({ column }) => <SortableHeader column={column}>ยอดรวม</SortableHeader>,
        cell: ({ row }) => formatCurrency(row.original.total),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'ชำระเงิน',
        meta: { className: 'hidden md:table-cell' },
      },
      {
        id: 'items',
        header: 'รายการ',
        cell: ({ row }) => row.original.items.length,
        meta: { className: 'hidden md:table-cell' },
      },
      {
        id: 'actions',
        header: 'อัปเดตสถานะ',
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            disabled={statusMutation.isPending}
            onValueChange={(status) => statusMutation.mutate({ orderId: row.original.id, status })}
          >
            <SelectTrigger className="w-[180px]" aria-label="อัปเดตสถานะคำสั่งซื้อ">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {labelOrderStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
    ],
    [statusMutation],
  );

  return (
    <div>
      <PageHeader
        title="คำสั่งซื้อ"
        description="จัดการและดำเนินการคำสั่งซื้อจากลูกค้า"
        action={
          <div className="w-48">
            <label
              htmlFor="orders-status-filter"
              className="mb-1 block text-xs font-medium text-muted"
            >
              กรองตามสถานะ
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="orders-status-filter">
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
        }
      />

      {isLoading ? <p className="text-muted">กำลังโหลดคำสั่งซื้อ...</p> : null}
      {error ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'โหลดคำสั่งซื้อไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading ? (
        <DataTable columns={columns} data={filteredOrders} emptyMessage="ไม่พบคำสั่งซื้อ" />
      ) : null}
    </div>
  );
}
