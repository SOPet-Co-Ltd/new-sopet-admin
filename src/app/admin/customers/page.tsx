'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { CustomersEmptyState } from '@/components/admin/customers/customers-empty-state';
import { CustomersListSkeleton } from '@/components/admin/customers/customers-list-skeleton';
import { CustomersMobileList } from '@/components/admin/customers/customers-mobile-list';
import { CustomersSearchField } from '@/components/admin/customers/customers-search-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { useAdminCustomers } from '@/hooks/useAdminCustomers';
import { getAdminCustomerDetail } from '@/lib/api/admin-customers';
import { createDetailPrefetchHandlers } from '@/lib/react-query/prefetch-dashboard-nav';
import { queryKeys } from '@/lib/react-query/keys';
import { cn, formatDate } from '@/lib/utils';
import type { AdminCustomer } from '@/types';

export default function AdminCustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;

  const queryParams = useMemo(
    () => ({ search: trimmedSearch || undefined, page, limit: 20 }),
    [trimmedSearch, page],
  );

  const { data, isLoading, isFetching, error } = useAdminCustomers(queryParams);

  const getDetailPrefetchHandlers = useCallback(
    (customerId: string) =>
      createDetailPrefetchHandlers(() => {
        void queryClient.prefetchQuery({
          queryKey: queryKeys.adminCustomers.detailInsights(customerId),
          queryFn: () => getAdminCustomerDetail(customerId),
        });
      }),
    [queryClient],
  );

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <SortableHeader column={column}>ลูกค้า</SortableHeader>,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.original.fullName || '—'}</p>
            <p className="truncate text-sm text-muted-foreground">{row.original.phone}</p>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'อีเมล',
        cell: ({ row }) => <span className="text-ink">{row.original.email || '—'}</span>,
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
        id: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge status={row.original.isActive ? 'published' : 'draft'}>
            {row.original.isActive ? 'ใช้งานอยู่' : 'ระงับ'}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <SortableHeader column={column}>สมัครเมื่อ</SortableHeader>,
        cell: ({ row }) =>
          row.original.createdAt ? (
            <span className="text-sm text-muted-foreground">
              {formatDate(row.original.createdAt)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
        meta: { className: 'hidden lg:table-cell' },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Button size="sm" variant="outline" asChild className="h-8">
              <Link
                href={`/admin/customers/${row.original.id}`}
                {...getDetailPrefetchHandlers(row.original.id)}
              >
                แก้ไข
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [getDetailPrefetchHandlers],
  );

  const pagination = data?.pagination;
  const customers = data?.items ?? [];
  const showEmpty = !isLoading && !error && customers.length === 0;
  const showList = !isLoading && !error && customers.length > 0;

  const resultLabel = useMemo(() => {
    if (!pagination) return null;
    const totalLabel = pagination.total.toLocaleString('th-TH');
    if (hasSearch) {
      return `พบ ${totalLabel} รายการ`;
    }
    if (pagination.totalPages > 1) {
      return `หน้า ${pagination.page} จาก ${pagination.totalPages} · ทั้งหมด ${totalLabel} รายการ`;
    }
    return `ลูกค้าทั้งหมด ${totalLabel} รายการ`;
  }, [hasSearch, pagination]);

  function clearSearch() {
    setSearch('');
    setPage(1);
  }

  function goToCustomer(customer: AdminCustomer) {
    router.push(`/admin/customers/${customer.id}`);
  }

  return (
    <div>
      <PageHeader title="ลูกค้า" description="จัดการบัญชีลูกค้าทั้งหมดในแพลตฟอร์ม" />

      <div className="mb-6 flex max-w-md items-center gap-2">
        <CustomersSearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onClear={clearSearch}
        />
      </div>

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'โหลดรายการลูกค้าไม่สำเร็จ'}
        </p>
      ) : null}

      <div
        className={cn('space-y-3', isFetching && !isLoading ? 'opacity-80' : undefined)}
        aria-busy={isFetching || undefined}
      >
        {isLoading ? <CustomersListSkeleton /> : null}

        {showEmpty ? (
          <CustomersEmptyState hasSearch={hasSearch} onClearSearch={clearSearch} />
        ) : null}

        {showList ? (
          <>
            {resultLabel ? (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {resultLabel}
              </p>
            ) : null}

            <CustomersMobileList
              customers={customers}
              onCustomerClick={goToCustomer}
              getDetailPrefetchHandlers={getDetailPrefetchHandlers}
            />

            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={customers}
                emptyMessage="ไม่พบลูกค้า"
                onRowClick={goToCustomer}
                onRowMouseEnter={(customer) => {
                  getDetailPrefetchHandlers(customer.id).onMouseEnter();
                }}
              />
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-muted-foreground">
                <span className="tabular-nums">
                  หน้า {pagination.page} จาก {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages || isFetching}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
