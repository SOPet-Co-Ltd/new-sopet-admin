'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { labelStoreStatus } from '@/lib/i18n/th';
import type { AdminVendorStore } from '@/types';

type AdminVendorStoresTableProps = {
  stores: AdminVendorStore[];
};

export function AdminVendorStoresTable({ stores }: AdminVendorStoresTableProps) {
  const columns = useMemo<ColumnDef<AdminVendorStore>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'ชื่อร้าน',
        cell: ({ row }) => (
          <Link
            href={`/admin/stores/${row.original.id}`}
            className="font-medium text-brand hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => <span className="text-muted">{row.original.slug}</span>,
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.status === 'approved' ? 'published' : 'draft'}>
            {labelStoreStatus(row.original.status)}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold text-ink">ร้านค้าที่เป็นเจ้าของ</h2>
        <p className="text-sm text-muted">ร้านค้าทั้งหมด {stores.length} ร้าน</p>
      </CardHeader>
      <CardBody>
        <DataTable columns={columns} data={stores} emptyMessage="ยังไม่มีร้านค้า" />
      </CardBody>
    </Card>
  );
}
