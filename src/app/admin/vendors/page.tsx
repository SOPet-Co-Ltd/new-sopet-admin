'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAdminVendors } from '@/hooks/useAdminVendors';
import { labelUserRole } from '@/lib/i18n/th';
import type { AdminVendor } from '@/types';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function AdminVendorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: vendors = [], isLoading, error } = useAdminVendors(search || undefined);

  const filteredVendors = useMemo(() => {
    if (statusFilter === 'all') return vendors;
    if (statusFilter === 'active') return vendors.filter((v) => v.isActive !== false);
    return vendors.filter((v) => v.isActive === false);
  }, [vendors, statusFilter]);

  const columns = useMemo<ColumnDef<AdminVendor>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <SortableHeader column={column}>ผู้ขาย</SortableHeader>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.fullName}</p>
            <p className="text-xs text-muted">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'บทบาท',
        cell: ({ row }) => labelUserRole(row.original.role),
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'storeCount',
        header: 'ร้านค้า',
        cell: ({ row }) => row.original.storeCount ?? 0,
      },
      {
        id: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.isActive !== false ? 'published' : 'draft'}>
            {row.original.isActive !== false ? 'ใช้งานอยู่' : 'ระงับ'}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <SortableHeader column={column}>สมัครเมื่อ</SortableHeader>,
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString('th-TH')
            : '—',
        meta: { className: 'hidden md:table-cell' },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/admin/vendors/${row.original.id}`}>แก้ไข</Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="ผู้ขาย" description="จัดการบัญชีผู้ขาย" />

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm flex-1">
          <Input
            type="search"
            aria-label="ค้นหาผู้ขาย"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'all', label: 'ทั้งหมด' },
              { value: 'active', label: 'ใช้งานอยู่' },
              { value: 'inactive', label: 'ระงับ' },
            ] as const
          ).map(({ value, label }) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={statusFilter === value ? 'default' : 'outline'}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">{error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}</p>
      ) : null}

      {!isLoading ? (
        <DataTable
          columns={columns}
          data={filteredVendors}
          emptyMessage={search || statusFilter !== 'all' ? 'ไม่พบผู้ขาย' : 'ไม่มีผู้ขาย'}
        />
      ) : null}
    </div>
  );
}
