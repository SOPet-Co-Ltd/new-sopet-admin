'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { labelVendorActivity } from '@/lib/i18n/th';
import { formatDateTime } from '@/lib/utils';
import type { AdminVendorActivity } from '@/types';

type ActivityRow = AdminVendorActivity & {
  description: string;
};

type AdminVendorActivityLogProps = {
  activities: AdminVendorActivity[];
};

function buildActivityDescription(activity: AdminVendorActivity): string {
  if (activity.kind === 'order_received' && activity.orderNumber) {
    return `คำสั่งซื้อ ${activity.orderNumber}`;
  }
  if (activity.storeName) {
    return activity.storeName;
  }
  return '—';
}

export function AdminVendorActivityLog({ activities }: AdminVendorActivityLogProps) {
  const rows = useMemo<ActivityRow[]>(
    () =>
      activities.map((activity) => ({
        ...activity,
        description: buildActivityDescription(activity),
      })),
    [activities],
  );

  const columns = useMemo<ColumnDef<ActivityRow>[]>(
    () => [
      {
        accessorKey: 'kind',
        header: 'กิจกรรม',
        cell: ({ row }) => labelVendorActivity(row.original.kind),
      },
      {
        accessorKey: 'description',
        header: 'รายละเอียด',
        cell: ({ row }) => row.original.description,
        meta: { className: 'hidden sm:table-cell' },
      },
      {
        accessorKey: 'occurredAt',
        header: 'เมื่อ',
        cell: ({ row }) => formatDateTime(row.original.occurredAt),
        meta: { className: 'text-right' },
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold text-ink">บันทึกกิจกรรม</h2>
        <p className="text-sm text-muted">เหตุการณ์สำคัญจากบัญชี ร้านค้า และคำสั่งซื้อล่าสุด</p>
      </CardHeader>
      <CardBody className="pt-0">
        <DataTable columns={columns} data={rows} emptyMessage="ยังไม่มีกิจกรรม" />
      </CardBody>
    </Card>
  );
}
