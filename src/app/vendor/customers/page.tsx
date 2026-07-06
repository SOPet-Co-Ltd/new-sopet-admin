'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useVendorCustomers } from '@/hooks/useVendorCustomers';
import type { VendorCustomer } from '@/types';

export default function VendorCustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ search: search || undefined, page, limit: 20 }),
    [search, page],
  );

  const { data, isLoading, error } = useVendorCustomers(queryParams);

  const columns = useMemo<ColumnDef<VendorCustomer>[]>(
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
        id: 'verified',
        header: 'ยืนยัน',
        cell: ({ row }) => (
          <Badge status={row.original.isVerified ? 'published' : 'draft'}>
            {row.original.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/vendor/customers/${row.original.id}`}>ดูรายละเอียด</Link>
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
      <PageHeader title="ลูกค้า" description="ลูกค้าที่เคยสั่งซื้อสินค้าจากร้านของคุณ" />

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
            emptyMessage="ยังไม่มีลูกค้าที่สั่งซื้อจากร้านนี้"
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
