'use client';

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
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
import { DataTable, ServerSortHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAdminStores } from '@/hooks/useAdminStores';
import { getErrorMessage } from '@/lib/api/errors';
import { labelStoreStatus } from '@/lib/i18n/th';
import {
  parseEnumParam,
  parsePageParam,
  parseSearchQuery,
  parseSortParam,
  serializeEnumParam,
  serializePageParam,
  serializeSearchQuery,
  serializeSortParam,
} from '@/lib/navigation/list-query-params';
import { useDebouncedSearchDraft } from '@/lib/navigation/use-debounced-search-draft';
import { useListQueryState, type ListQuerySpec } from '@/lib/navigation/use-list-query-state';
import {
  createDetailPrefetchHandlers,
  prefetchAdminStoreDetail,
} from '@/lib/react-query/prefetch-dashboard-nav';
import { cn, formatDate } from '@/lib/utils';
import type { AdminStore } from '@/types';

const SEARCH_DEBOUNCE_MS = 300;
const ADMIN_STORES_PAGE_SIZE = 20;
const STORE_STATUS_VALUES = ['all', 'pending', 'approved', 'rejected', 'suspended'] as const;
const STORE_SORTS = ['createdAt:desc', 'createdAt:asc', 'name:asc', 'name:desc'] as const;
const DEFAULT_STORE_SORT = 'createdAt:desc';

const adminStoresQuerySpec = {
  page: { parse: parsePageParam, serialize: serializePageParam },
  q: { parse: parseSearchQuery, serialize: serializeSearchQuery },
  status: {
    parse: (raw: string | null) =>
      parseEnumParam(raw, STORE_STATUS_VALUES, 'all') as StoreStatusFilter,
    serialize: (value: StoreStatusFilter) => serializeEnumParam(value, 'all'),
  },
  sort: {
    parse: (raw: string | null) => parseSortParam(raw, STORE_SORTS, DEFAULT_STORE_SORT),
    serialize: (value: string) => serializeSortParam(value, DEFAULT_STORE_SORT),
  },
} satisfies ListQuerySpec;

function toggleListSort(current: string, field: string): string {
  const [activeField, activeDir] = current.split(':');
  if (activeField !== field) {
    return field === 'createdAt' ? `${field}:desc` : `${field}:asc`;
  }
  return `${field}:${activeDir === 'asc' ? 'desc' : 'asc'}`;
}

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
  const [params, setParams] = useListQueryState(adminStoresQuerySpec);
  const { page, q: search, status: statusFilter, sort } = params;
  const commitSearch = useCallback((next: string) => setParams({ q: next }), [setParams]);
  const [searchInput, setSearchInput] = useDebouncedSearchDraft(
    search,
    commitSearch,
    SEARCH_DEBOUNCE_MS,
  );

  const trimmedSearch = search;
  const hasSearch = trimmedSearch.length > 0;
  const hasStatusFilter = statusFilter !== 'all';
  const hasFilters = hasSearch || hasStatusFilter;

  const queryParams = useMemo(
    () => ({
      page,
      limit: ADMIN_STORES_PAGE_SIZE,
      search: trimmedSearch || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sort: sort === DEFAULT_STORE_SORT ? undefined : sort,
    }),
    [page, trimmedSearch, statusFilter, sort],
  );

  const { data, isLoading, isFetching, error } = useAdminStores(queryParams);
  const stores = data?.items ?? [];
  const pagination = data?.pagination;

  const columns = useMemo<ColumnDef<AdminStore>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => (
          <ServerSortHeader
            label="ร้านค้า"
            active={sort.startsWith('name:')}
            direction={
              sort.startsWith('name:') ? (sort.endsWith('asc') ? 'asc' : 'desc') : undefined
            }
            onToggle={() => setParams({ sort: toggleListSort(sort, 'name') })}
          />
        ),
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
        header: () => (
          <ServerSortHeader
            label="สร้างเมื่อ"
            active={sort.startsWith('createdAt:')}
            direction={
              sort.startsWith('createdAt:') ? (sort.endsWith('asc') ? 'asc' : 'desc') : undefined
            }
            onToggle={() => setParams({ sort: toggleListSort(sort, 'createdAt') })}
          />
        ),
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
    [queryClient, setParams, sort],
  );

  const resultLabel = useMemo(() => {
    if (!pagination) return null;
    const totalLabel = pagination.total.toLocaleString('th-TH');
    if (hasFilters) {
      return `พบ ${totalLabel} รายการ`;
    }
    if (pagination.totalPages > 1) {
      return `หน้า ${pagination.page} จาก ${pagination.totalPages} · ทั้งหมด ${totalLabel} รายการ`;
    }
    return `ร้านค้าทั้งหมด ${totalLabel} รายการ`;
  }, [hasFilters, pagination]);

  const showEmpty = !isLoading && !error && stores.length === 0;
  const showList = !isLoading && !error && stores.length > 0;

  function clearFilters() {
    setSearchInput('');
    setParams({ q: '', status: 'all', sort: DEFAULT_STORE_SORT, page: 1 });
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
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="pr-10 placeholder:text-muted-foreground"
          />
          {hasSearch || searchInput.trim().length > 0 ? (
            <button
              type="button"
              aria-label="ล้างช่องค้นหา"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 motion-reduce:transition-none"
              onClick={() => {
                setSearchInput('');
                setParams({ q: '' });
              }}
            >
              <HiXMark className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <StoresStatusFilter
          value={statusFilter}
          onChange={(value) => setParams({ status: value })}
        />
      </div>

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {getErrorMessage(error, 'โหลดร้านค้าไม่สำเร็จ')}
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
              stores={stores}
              onStoreClick={goToStore}
              getStatusBadge={storeStatusBadge}
            />

            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={stores}
                emptyMessage="ไม่พบร้านค้า"
                onRowClick={goToStore}
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
                    onClick={() => setParams((current) => ({ page: current.page - 1 }))}
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages || isFetching}
                    onClick={() => setParams((current) => ({ page: current.page + 1 }))}
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
