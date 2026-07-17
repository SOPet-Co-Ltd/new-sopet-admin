'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
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
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAdminVendors } from '@/hooks/useAdminVendors';
import { labelUserRole } from '@/lib/i18n/th';
import { cn, formatDate } from '@/lib/utils';
import type { AdminVendor } from '@/types';

function vendorStatusBadge(vendor: AdminVendor): { label: string; className: string } {
  if (vendor.isActive !== false) {
    return { label: 'ใช้งานอยู่', className: 'bg-success-bg text-success' };
  }
  return { label: 'ระงับ', className: 'bg-danger-bg text-danger' };
}

export default function AdminVendorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VendorStatusFilter>('all');

  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;
  const hasStatusFilter = statusFilter !== 'all';
  const hasFilters = hasSearch || hasStatusFilter;

  const {
    data: vendors = [],
    isLoading,
    isFetching,
    error,
  } = useAdminVendors(trimmedSearch || undefined);

  const filteredVendors = useMemo(() => {
    if (statusFilter === 'all') return vendors;
    if (statusFilter === 'active') return vendors.filter((vendor) => vendor.isActive !== false);
    return vendors.filter((vendor) => vendor.isActive === false);
  }, [vendors, statusFilter]);

  const columns = useMemo<ColumnDef<AdminVendor>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <SortableHeader column={column}>ผู้ขาย</SortableHeader>,
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
        header: 'ร้านค้า',
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
        header: ({ column }) => <SortableHeader column={column}>สมัครเมื่อ</SortableHeader>,
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
    [],
  );

  const resultLabel = useMemo(() => {
    const filteredCount = filteredVendors.length;
    const totalCount = vendors.length;
    const filteredLabel = filteredCount.toLocaleString('th-TH');
    const totalLabel = totalCount.toLocaleString('th-TH');

    if (hasFilters) {
      return `แสดง ${filteredLabel} จาก ${totalLabel} รายการ`;
    }
    return `ผู้ขายทั้งหมด ${totalLabel} รายการ`;
  }, [filteredVendors.length, hasFilters, vendors.length]);

  const showEmpty = !isLoading && !error && filteredVendors.length === 0;
  const showList = !isLoading && !error && filteredVendors.length > 0;

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
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

        <VendorsStatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'โหลดรายการผู้ขายไม่สำเร็จ'}
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
              vendors={filteredVendors}
              onVendorClick={goToVendor}
              getStatusBadge={vendorStatusBadge}
            />

            <div className="hidden md:block">
              <DataTable
                columns={columns}
                data={filteredVendors}
                emptyMessage="ไม่พบผู้ขาย"
                onRowClick={goToVendor}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
