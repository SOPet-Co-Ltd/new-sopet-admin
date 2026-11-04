'use client';

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef } from '@tanstack/react-table';
import { HiXMark } from 'react-icons/hi2';
import { VendorsEmptyState } from '@/components/admin/vendors/vendors-empty-state';
import { VendorsListSkeleton } from '@/components/admin/vendors/vendors-list-skeleton';
import { VendorsMobileList } from '@/components/admin/vendors/vendors-mobile-list';
import {
  VendorsStatusFilter,
  type VendorStatusFilter,
} from '@/components/admin/vendors/vendors-status-filter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { DataTable, ServerSortHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAdminVendors } from '@/hooks/useAdminVendors';
import { getErrorMessage } from '@/lib/api/errors';
import { labelUserRole } from '@/lib/i18n/th';
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
import { cn, formatDate } from '@/lib/utils';
import type { AdminVendor } from '@/types';

const SEARCH_DEBOUNCE_MS = 300;
const ADMIN_VENDORS_PAGE_SIZE = 20;
const VENDOR_STATUS_VALUES = ['all', 'active', 'inactive'] as const;
const VENDOR_SORTS = [
  'createdAt:desc',
  'createdAt:asc',
  'fullName:asc',
  'fullName:desc',
  'storeCount:asc',
  'storeCount:desc',
] as const;
const DEFAULT_VENDOR_SORT = 'createdAt:desc';

const adminVendorsQuerySpec = {
  page: { parse: parsePageParam, serialize: serializePageParam },
  q: { parse: parseSearchQuery, serialize: serializeSearchQuery },
  status: {
    parse: (raw: string | null) =>
      parseEnumParam(raw, VENDOR_STATUS_VALUES, 'all') as VendorStatusFilter,
    serialize: (value: VendorStatusFilter) => serializeEnumParam(value, 'all'),
  },
  sort: {
    parse: (raw: string | null) => parseSortParam(raw, VENDOR_SORTS, DEFAULT_VENDOR_SORT),
    serialize: (value: string) => serializeSortParam(value, DEFAULT_VENDOR_SORT),
  },
} satisfies ListQuerySpec;

function toggleListSort(current: string, field: string): string {
  const [activeField, activeDir] = current.split(':');
  if (activeField !== field) {
    return field === 'createdAt' ? `${field}:desc` : `${field}:asc`;
  }
  return `${field}:${activeDir === 'asc' ? 'desc' : 'asc'}`;
}

function vendorStatusBadge(vendor: AdminVendor): { label: string; className: string } {
  if (vendor.isActive !== false) {
    return { label: 'ใช้งานอยู่', className: 'bg-success-bg text-success' };
  }
  return { label: 'ระงับ', className: 'bg-danger-bg text-danger' };
}

export default function AdminVendorsPage() {
  const router = useRouter();
  const [params, setParams] = useListQueryState(adminVendorsQuerySpec);
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
      limit: ADMIN_VENDORS_PAGE_SIZE,
      search: trimmedSearch || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sort: sort === DEFAULT_VENDOR_SORT ? undefined : sort,
    }),
    [page, trimmedSearch, statusFilter, sort],
  );

  const { data, isLoading, isFetching, error } = useAdminVendors(queryParams);
  const vendors = data?.items ?? [];
  const pagination = data?.pagination;

  const columns = useMemo<ColumnDef<AdminVendor>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: () => (
          <ServerSortHeader
            label="ผู้ขาย"
            active={sort.startsWith('fullName:')}
            direction={
              sort.startsWith('fullName:') ? (sort.endsWith('asc') ? 'asc' : 'desc') : undefined
            }
            onToggle={() => setParams({ sort: toggleListSort(sort, 'fullName') })}
          />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.original.fullName}</p>
            <p className="truncate text-sm text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'บทบาท',
        cell: ({ row }) => (
          <span className="text-sm text-ink">{labelUserRole(row.original.role)}</span>
        ),
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'storeCount',
        header: () => (
          <ServerSortHeader
            label="ร้านค้า"
            active={sort.startsWith('storeCount:')}
            direction={
              sort.startsWith('storeCount:') ? (sort.endsWith('asc') ? 'asc' : 'desc') : undefined
            }
            onToggle={() => setParams({ sort: toggleListSort(sort, 'storeCount') })}
          />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-ink">
            {(row.original.storeCount ?? 0).toLocaleString('th-TH')}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'สถานะ',
        cell: ({ row }) => {
          const statusBadge = vendorStatusBadge(row.original);
          return <Badge className={statusBadge.className}>{statusBadge.label}</Badge>;
        },
      },
      {
        accessorKey: 'createdAt',
        header: () => (
          <ServerSortHeader
            label="สมัครเมื่อ"
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
              <Link href={`/admin/vendors/${row.original.id}`}>แก้ไข</Link>
            </Button>
          </div>
        ),
      },
    ],
    [setParams, sort],
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
    return `ผู้ขายทั้งหมด ${totalLabel} รายการ`;
  }, [hasFilters, pagination]);

  const showEmpty = !isLoading && !error && vendors.length === 0;
  const showList = !isLoading && !error && vendors.length > 0;

  function clearFilters() {
    setSearchInput('');
    setParams({ q: '', status: 'all', sort: DEFAULT_VENDOR_SORT, page: 1 });
  }

  function goToVendor(vendor: AdminVendor) {
    router.push(`/admin/vendors/${vendor.id}`);
  }

  return (
    <div>
      <PageHeader
        title="ผู้ขาย"
        description="จัดการบัญชีผู้ขาย ร้านค้า และสถานะการใช้งาน"
        action={
          <Button asChild variant="outline">
            <Link href="/admin/requests?tab=invitations">เชิญผู้ขาย</Link>
          </Button>
        }
      />

      <Card className="mb-6">
        <CardBody className="text-sm text-pretty text-muted-foreground">
          คำเชิญและคำขอเปิดร้านจัดการที่{' '}
          <Link href="/admin/requests" className="text-brand hover:underline">
            ศูนย์คำขอ
          </Link>
        </CardBody>
      </Card>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Input
            type="search"
            aria-label="ค้นหาผู้ขาย"
            placeholder="ค้นหาชื่อหรืออีเมล..."
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

        <VendorsStatusFilter
          value={statusFilter}
          onChange={(value) => setParams({ status: value })}
        />
      </div>

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {getErrorMessage(error, 'โหลดรายการผู้ขายไม่สำเร็จ')}
        </p>
      ) : null}

      <div
        className={cn('space-y-3', isFetching && !isLoading ? 'opacity-80' : undefined)}
        aria-busy={isFetching || undefined}
      >
        {isLoading ? <VendorsListSkeleton /> : null}

        {showEmpty ? (
          <VendorsEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        ) : null}

        {showList ? (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {resultLabel}
            </p>

            <VendorsMobileList
              vendors={vendors}
              onVendorClick={goToVendor}
              getStatusBadge={vendorStatusBadge}
            />

            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={vendors}
                emptyMessage="ไม่พบผู้ขาย"
                onRowClick={goToVendor}
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
