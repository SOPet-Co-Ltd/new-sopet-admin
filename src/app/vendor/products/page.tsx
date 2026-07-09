'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useDeleteProduct } from '@/hooks/useProductMutations';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import {
  createDetailPrefetchHandlers,
  prefetchVendorProductDetail,
} from '@/lib/react-query/prefetch-dashboard-nav';
import { labelProductStatus } from '@/lib/i18n/th';
import type { Product } from '@/types';

export default function VendorProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ search: search || undefined, page, limit: 10 }),
    [search, page],
  );

  const { data, isLoading, error } = useVendorProducts(queryParams);
  const deleteMutation = useDeleteProduct();

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column}>สินค้า</SortableHeader>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.name}</p>
            <p className="text-xs text-muted">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: 'variants',
        header: 'ตัวเลือก',
        cell: ({ row }) => (
          <span className="text-sm text-muted">{row.original.variants?.length ?? 0}</span>
        ),
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.status}>{labelProductStatus(row.original.status)}</Badge>
        ),
      },
      {
        accessorKey: 'category',
        header: 'หมวดหมู่',
        cell: ({ row }) => row.original.category ?? '—',
        meta: { className: 'hidden md:table-cell' },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vendor/products/${row.original.id}/variants`}>ตัวเลือก</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`/vendor/products/${row.original.id}/edit`}
                {...createDetailPrefetchHandlers(() =>
                  prefetchVendorProductDetail(queryClient, row.original.id),
                )}
              >
                แก้ไข
              </Link>
            </Button>
            <ConfirmDeleteButton
              confirmLabel={row.original.name}
              title="ลบสินค้า"
              variant="destructive"
              disabled={deleteMutation.isPending}
              isDeleting={deleteMutation.isPending}
              onConfirm={async () => {
                await deleteMutation.mutateAsync(row.original.id);
              }}
            />
          </div>
        ),
      },
    ],
    [deleteMutation, queryClient],
  );

  const pagination = data?.pagination;
  const products = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="สินค้า"
        description="ขั้นที่ 1: สร้างสินค้าและตัวเลือก · ขั้นที่ 2: กำหนด SKU สต็อก และราคาแต่ละรายการ"
        action={
          <Button asChild>
            <Link href="/vendor/products/new">เพิ่มสินค้า</Link>
          </Button>
        }
      />

      <div className="mb-5 max-w-sm">
        <Input
          type="search"
          aria-label="ค้นหาสินค้า"
          placeholder="ค้นหาสินค้า..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? <p className="text-muted">กำลังโหลดสินค้า...</p> : null}
      {error ? (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : 'โหลดสินค้าไม่สำเร็จ'}
        </p>
      ) : null}
      {deleteMutation.error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : 'ลบสินค้าไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading ? (
        <>
          <DataTable columns={columns} data={products} emptyMessage="ไม่พบสินค้า" />
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
