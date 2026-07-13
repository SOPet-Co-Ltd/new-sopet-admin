'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { labelStoreStatus, membershipRoleLabels } from '@/lib/i18n/th';
import { formatDateTime } from '@/lib/utils';
import type { AdminVendorMembership } from '@/types';

type AdminVendorMembershipsTableProps = {
  memberships: AdminVendorMembership[];
};

export function AdminVendorMembershipsTable({ memberships }: AdminVendorMembershipsTableProps) {
  const columns = useMemo<ColumnDef<AdminVendorMembership>[]>(
    () => [
      {
        accessorKey: 'storeName',
        header: 'ร้านค้า',
        cell: ({ row }) => (
          <Link
            href={`/admin/stores/${row.original.storeId}`}
            className="font-medium text-brand hover:underline"
          >
            {row.original.storeName}
          </Link>
        ),
      },
      {
        accessorKey: 'role',
        header: 'บทบาท',
        cell: ({ row }) => membershipRoleLabels[row.original.role] ?? row.original.role,
      },
      {
        accessorKey: 'storeStatus',
        header: 'สถานะร้าน',
        cell: ({ row }) => (
          <Badge status={row.original.storeStatus === 'approved' ? 'published' : 'draft'}>
            {labelStoreStatus(row.original.storeStatus)}
          </Badge>
        ),
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'joinedAt',
        header: 'เข้าร่วมเมื่อ',
        cell: ({ row }) => formatDateTime(row.original.joinedAt),
        meta: { className: 'hidden lg:table-cell' },
      },
    ],
    [],
  );

  if (memberships.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold text-ink">สมาชิกร้านค้าอื่น</h2>
        <p className="text-sm text-muted">ร้านที่ผู้ขายเข้าร่วมในฐานะพนักงานหรือผู้จัดการ</p>
      </CardHeader>
      <CardBody>
        <DataTable columns={columns} data={memberships} emptyMessage="ไม่มีสมาชิกภาพอื่น" />
      </CardBody>
    </Card>
  );
}
