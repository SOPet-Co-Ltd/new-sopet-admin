'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { HiXMark } from 'react-icons/hi2';
import { StoresEmptyState } from '@/components/admin/stores/stores-empty-state';
import { StoresListSkeleton } from '@/components/admin/stores/stores-list-skeleton';
import { StoresMobileList } from '@/components/admin/stores/stores-mobile-list';
import {
  StoresStatusFilter,
  type StoreStatusFilter,
} from '@/components/admin/stores/stores-status-filter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAdminStores } from '@/hooks/useAdminStores';
import { labelStoreStatus } from '@/lib/i18n/th';
import {
  createDetailPrefetchHandlers,
  prefetchAdminStoreDetail,
} from '@/lib/react-query/prefetch-dashboard-nav';
import { cn, formatDate } from '@/lib/utils';
import type { AdminStore } from '@/types';

function storeStatusBadge(store: AdminStore): { label: string; className: string } {
  const status = store.status;
  if (status === 'approved') {
    return { label: labelStoreStatus(status), className: 'bg-success-bg text-success' };
  }
  if (status === 'pending') {
    return { label: labelStoreStatus(status), className: 'bg-warning-bg text-warning-text' };
  }
  if (status === 'rejected') {
    return { label: labelStoreStatus(status), className: 'bg-danger-bg text-danger' };
  }
  if (status === 'suspended') {
    return { label: labelStoreStatus(status), className: 'bg-danger-bg text-danger' };
  }
  return { label: labelStoreStatus(status), className: '' };
}

export default function AdminStoresPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StoreStatusFilter>('all');

  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;
  const hasStatusFilter = statusFilter !== 'all';
  const hasFilters = hasSearch || hasStatusFilter;

  const { data: stores = [], isLoading, isFetching, error } = useAdminStores();

  const filteredStores = useMemo(() => {
    const q = trimmedSearch.toLowerCase();
    return stores.filter((store) => {
      if (statusFilter !== 'all' && store.status !== statusFilter) return false;
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.slug.toLowerCase().includes(q) ||
        (store.ownerEmail?.toLowerCase().includes(q) ?? false) ||
        (store.ownerFullName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [stores, trimmedSearch, statusFilter]);

  const columns = useMemo<ColumnDef<AdminStore>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column}>ร้านค้า</SortableHeader>,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.original.name}</p>
            <p className="truncate text-sm text-muted-foreground">{row.original.slug}</p>
          </div>
        ),
      },
      {
        id: 'owner',
        header: 'เจ้าของ',
        cell: ({ row }) => {
          const { ownerFullName, ownerEmail } = row.original;
          if (ownerFullName || ownerEmail) {
            return (
              <div className="min-w-0">
                {ownerFullName ? (
                  <p className="truncate text-sm text-ink">{ownerFullName}</p>
                ) : null}
                {ownerEmail ? (
                  <p className="truncate text-sm text-muted-foreground">{ownerEmail}</p>
                ) : null}
              </div>
            );
          }
          return <span className="text-sm text-muted-foreground">—</span>;
        },
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'status',
        header: 'สถานะ',
        cell: ({ row }) => {
          const statusBadge = storeStatusBadge(row.original);
          return <Badge className={statusBadge.className}>{statusBadge.label}</Badge>;
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <SortableHeader column={column}>สร้างเมื่อ</SortableHeader>,
        cell: ({ row }) =>
          row.original.createdAt ? (
            <span className="text-sm text-muted-foreground">
              {formatDate(row.original.createdAt)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
        meta: { className: 'hidden md:table-cell' },
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
                href={`/admin/stores/${row.original.id}`}
                {...createDetailPrefetchHandlers(() =>
                  prefetchAdminStoreDetail(queryClient, row.original.id),
                )}
              >
                แก้ไข
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [queryClient],
  );

  const resultLabel = useMemo(() => {
    const filteredCount = filteredStores.length;
    const totalCount = stores.length;
    const filteredLabel = filteredCount.toLocaleString('th-TH');
    const totalLabel = totalCount.toLocaleString('th-TH');

    if (hasFilters) {
      return `แสดง ${filteredLabel} จาก ${totalLabel} รายการ`;
    }
    return `ร้านค้าทั้งหมด ${totalLabel} รายการ`;
  }, [filteredStores.length, hasFilters, stores.length]);

  const showEmpty = !isLoading && !error && filteredStores.length === 0;
  const showList = !isLoading && !error && filteredStores.length > 0;

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
  }

  function goToStore(store: AdminStore) {
    router.push(`/admin/stores/${store.id}`);
  }

  return (
    <div>
      <PageHeader
        title="จัดการร้านค้า"
        description="ดูรายการร้านค้าทั้งหมด แก้ไข และสร้างร้านค้า"
        action={
          <Button asChild>
            <Link href="/admin/stores/new">สร้างร้านค้า</Link>
          </Button>
        }
      />

      <Card className="mb-6">
        <CardBody className="text-sm text-pretty text-muted-foreground">
          การอนุมัติคำขอเปิดร้านใหม่จัดการที่{' '}
          <Link href="/admin/requests" className="text-brand hover:underline">
            ศูนย์คำขอ
          </Link>
        </CardBody>
      </Card>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Input
            type="search"
            aria-label="ค้นหาร้านค้า"
            placeholder="ค้นหาชื่อร้าน slug หรือเจ้าของ..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pr-10 placeholder:text-muted-foreground"
          />
          {hasSearch ? (
            <button
              type="button"
              aria-label="ล้างช่องค้นหา"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:transition-none"
              onClick={() => setSearch('')}
            >
              <HiXMark className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <StoresStatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'โหลดร้านค้าไม่สำเร็จ'}
        </p>
      ) : null}

      <div
        className={cn('space-y-3', isFetching && !isLoading ? 'opacity-80' : undefined)}
        aria-busy={isFetching || undefined}
      >
        {isLoading ? <StoresListSkeleton /> : null}

        {showEmpty ? (
          <StoresEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        ) : null}

        {showList ? (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {resultLabel}
            </p>

            <StoresMobileList
              stores={filteredStores}
              onStoreClick={goToStore}
              getStatusBadge={storeStatusBadge}
            />

            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={filteredStores}
                emptyMessage="ไม่พบร้านค้า"
                onRowClick={goToStore}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
