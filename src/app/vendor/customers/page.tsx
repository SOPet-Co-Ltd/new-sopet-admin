'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { HiMagnifyingGlass, HiUsers, HiXMark } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useVendorCustomers } from '@/hooks/useVendorCustomers';
import { cn, formatDate } from '@/lib/utils';
import type { VendorCustomer } from '@/types';

function CustomersTableSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดลูกค้า">
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-36 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
              <div className="h-3 w-28 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
              <div className="h-3 w-40 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
            </div>
            <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:block">
        <div className="border-b border-border bg-surface/60 px-4 py-3">
          <div className="flex gap-8">
            <div className="h-4 w-20 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-4 w-14 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
        </div>
        <ul className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-4 px-4 py-3.5">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-40 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
                <div className="h-3 w-28 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
              </div>
              <div className="hidden h-4 w-44 animate-pulse rounded bg-surface motion-reduce:animate-none md:block" />
              <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
              <div className="hidden h-4 w-24 shrink-0 animate-pulse rounded bg-surface motion-reduce:animate-none lg:block" />
              <div className="h-8 w-24 shrink-0 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only">กำลังโหลดลูกค้า...</span>
    </div>
  );
}

function CustomersEmptyState({
  hasSearch,
  onClearSearch,
}: {
  hasSearch: boolean;
  onClearSearch: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground"
        aria-hidden="true"
      >
        {hasSearch ? <HiMagnifyingGlass className="size-6" /> : <HiUsers className="size-6" />}
      </div>
      <p className="mt-4 font-medium text-ink">
        {hasSearch ? 'ไม่พบลูกค้าที่ตรงกับคำค้นหา' : 'ยังไม่มีลูกค้าที่สั่งซื้อจากร้านนี้'}
      </p>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        {hasSearch
          ? 'ลองค้นหาด้วยชื่อ เบอร์โทร หรืออีเมลอื่น'
          : 'ลูกค้าจะปรากฏที่นี่หลังสั่งซื้อสินค้าจากร้านของคุณ'}
      </p>
      {hasSearch ? (
        <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onClearSearch}>
          ล้างคำค้นหา
        </Button>
      ) : null}
    </div>
  );
}

function CustomersMobileList({
  customers,
  onCustomerClick,
}: {
  customers: VendorCustomer[];
  onCustomerClick: (customer: VendorCustomer) => void;
}) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:hidden">
      {customers.map((customer) => {
        const displayName = customer.fullName || customer.phone;
        return (
          <li key={customer.id}>
            <div
              role="button"
              tabIndex={0}
              aria-label={`ดูรายละเอียด ${displayName}`}
              className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-200 ease-out hover:bg-surface/80 focus-visible:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 motion-reduce:transition-none"
              onClick={() => onCustomerClick(customer)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onCustomerClick(customer);
                }
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{displayName}</p>
                    {customer.fullName ? (
                      <p className="truncate text-sm text-muted-foreground">{customer.phone}</p>
                    ) : null}
                  </div>
                  <Badge status={customer.isVerified ? 'published' : 'draft'} className="mt-0.5">
                    {customer.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">อีเมล</dt>
                    <dd className="truncate text-ink">{customer.email || '—'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">สมัครเมื่อ</dt>
                    <dd className="text-ink">
                      {customer.createdAt ? formatDate(customer.createdAt) : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function VendorCustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;

  const queryParams = useMemo(
    () => ({ search: trimmedSearch || undefined, page, limit: 20 }),
    [trimmedSearch, page],
  );

  const { data, isLoading, isFetching, error } = useVendorCustomers(queryParams);

  const columns = useMemo<ColumnDef<VendorCustomer>[]>(
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

  function goToCustomer(customer: VendorCustomer) {
    router.push(`/vendor/customers/${customer.id}`);
  }

  return (
    <div>
      <PageHeader title="ลูกค้า" description="ลูกค้าที่เคยสั่งซื้อสินค้าจากร้านของคุณ" />

      <div className="mb-6 flex max-w-md items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            type="search"
            aria-label="ค้นหาลูกค้า"
            placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pr-10 placeholder:text-muted-foreground"
          />
          {hasSearch ? (
            <button
              type="button"
              aria-label="ล้างช่องค้นหา"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:transition-none"
              onClick={clearSearch}
            >
              <HiXMark className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
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
        {isLoading ? <CustomersTableSkeleton /> : null}

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

            <CustomersMobileList customers={customers} onCustomerClick={goToCustomer} />

            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={customers}
                emptyMessage="ยังไม่มีลูกค้าที่สั่งซื้อจากร้านนี้"
                onRowClick={goToCustomer}
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
