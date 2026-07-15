'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { VendorOrderTrackingLinkDialog } from '@/components/vendor/vendor-order-tracking-link-dialog';
import { VendorOrdersActionMenu } from '@/components/vendor/vendor-orders-action-menu';
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
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { ORDER_STATUSES } from '@/lib/config';
import { labelOrderStatus } from '@/lib/i18n/th';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';

export default function VendorOrdersPage() {
  const router = useRouter();
  const storeId = useVendorStoreId();
  const { data: orders = [], isLoading, error } = useVendorOrders(storeId);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackingDialogOrderNumber, setTrackingDialogOrderNumber] = useState<string | null>(null);
  const menuTriggerRef = useRef<HTMLElement | null>(null);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

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
          <VendorOrdersActionMenu
            orderId={row.original.id}
            orderNumber={row.original.orderNumber}
            onViewDetails={(orderId) => router.push(`/vendor/orders/${orderId}`)}
            onCopyTrackingLink={setTrackingDialogOrderNumber}
            menuTriggerRef={menuTriggerRef}
          />
        ),
      },
    ],
    [router],
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
        <DataTable
          columns={columns}
          data={filteredOrders}
          emptyMessage="ไม่พบคำสั่งซื้อ"
          onRowClick={(order) => router.push(`/vendor/orders/${order.id}`)}
        />
      ) : null}

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
