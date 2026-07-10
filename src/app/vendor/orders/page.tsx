'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { VendorOrderDetailDialog } from '@/components/vendor/vendor-order-detail-dialog';
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
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';

export default function VendorOrdersPage() {
  const searchParams = useSearchParams();
  const storeId = useVendorStoreId();
  const { data: orders = [], isLoading, error } = useVendorOrders();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const orderIdFromUrl = searchParams.get('orderId');

  useEffect(() => {
    if (orderIdFromUrl) {
      setSelectedOrderId(orderIdFromUrl);
    }
  }, [orderIdFromUrl]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => <SortableHeader column={column}>คำสั่งซื้อ</SortableHeader>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.orderNumber}</p>
            <p className="text-xs text-muted">{formatDateTime(row.original.createdAt)}</p>
          </div>
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
        header: ({ column }) => <SortableHeader column={column}>ยอดรวม</SortableHeader>,
        cell: ({ row }) => formatCurrency(row.original.total),
        meta: { className: 'hidden sm:table-cell' },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setSelectedOrderId(row.original.id)}>
              ดูรายละเอียด
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="คำสั่งซื้อ"
        description="ดูและดำเนินการคำสั่งซื้อจากลูกค้า"
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

      <VendorOrderDetailDialog
        order={selectedOrder}
        storeId={storeId}
        open={selectedOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
      />
    </div>
  );
}
