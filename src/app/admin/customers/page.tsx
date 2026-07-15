'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAdminCustomers } from '@/hooks/useAdminCustomers';
import type { AdminCustomer } from '@/types';

export default function AdminCustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ search: search || undefined, page, limit: 20 }),
    [search, page],
  );

  const { data, isLoading, error } = useAdminCustomers(queryParams);

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'ลูกค้า',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.fullName || '—'}</p>
            <p className="text-xs text-muted">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'อีเมล',
        cell: ({ row }) => row.original.email || '—',
        meta: { className: 'hidden md:table-cell' },
      },
      {
        id: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.isActive ? 'published' : 'draft'}>
            {row.original.isActive ? 'ใช้งานอยู่' : 'ระงับ'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/admin/customers/${row.original.id}`}>แก้ไข</Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const pagination = data?.pagination;
  const customers = data?.items ?? [];

  return (
    <div>
      <PageHeader title="ลูกค้า" description="จัดการบัญชีลูกค้าทั้งหมดในแพลตฟอร์ม" />

      <div className="mb-5 max-w-sm">
        <Input
          type="search"
          aria-label="ค้นหาลูกค้า"
          placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">
          {error instanceof Error ? error.message : 'โหลดรายการลูกค้าไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading ? (
        <>
          <DataTable
            columns={columns}
            data={customers}
            emptyMessage="ไม่พบลูกค้า"
            onRowClick={(customer) => router.push(`/admin/customers/${customer.id}`)}
          />
          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>
                หน้า {pagination.page} จาก {pagination.totalPages} (ทั้งหมด {pagination.total}{' '}
                รายการ)
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ก่อนหน้า
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ถัดไป
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
