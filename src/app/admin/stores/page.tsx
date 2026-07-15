'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminStores } from '@/hooks/useAdminStores';
import {
  createDetailPrefetchHandlers,
  prefetchAdminStoreDetail,
} from '@/lib/react-query/prefetch-dashboard-nav';
import { labelStoreStatus } from '@/lib/i18n/th';
import type { AdminStore, StoreStatus } from '@/types';

const STORE_STATUS_OPTIONS: Array<StoreStatus | 'all'> = [
  'all',
  'pending',
  'approved',
  'rejected',
  'suspended',
];

function storeStatusBadgeClass(status: string): string | undefined {
  if (status === 'suspended') return 'bg-danger/10 text-danger';
  if (status === 'approved') return 'bg-success-bg text-success';
  if (status === 'pending') return 'bg-warning-bg text-warning-text';
  if (status === 'rejected') return 'bg-danger-bg text-danger';
  return undefined;
}

export default function AdminStoresPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StoreStatus | 'all'>('all');

  const { data: stores = [], isLoading, error } = useAdminStores();

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
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
  }, [stores, search, statusFilter]);

  const columns = useMemo<ColumnDef<AdminStore>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column}>ร้านค้า</SortableHeader>,
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-ink">{row.original.name}</p>
            <p className="text-xs text-muted">{row.original.slug}</p>
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
              <div>
                {ownerFullName ? <p className="text-sm text-ink">{ownerFullName}</p> : null}
                {ownerEmail ? <p className="text-xs text-muted">{ownerEmail}</p> : null}
              </div>
            );
          }
          return '—';
        },
        meta: { className: 'hidden md:table-cell' },
      },
      {
        accessorKey: 'status',
        header: 'สถานะ',
        cell: ({ row }) => (
          <Badge className={storeStatusBadgeClass(row.original.status)}>
            {labelStoreStatus(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <SortableHeader column={column}>สร้างเมื่อ</SortableHeader>,
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
        <CardBody className="text-sm text-muted">
          การอนุมัติคำขอเปิดร้านใหม่จัดการที่{' '}
          <Link href="/admin/requests" className="text-brand hover:underline">
            ศูนย์คำขอ
          </Link>
        </CardBody>
      </Card>

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="max-w-sm flex-1">
          <Input
            type="search"
            aria-label="ค้นหาร้านค้า"
            placeholder="ค้นหาชื่อร้าน slug หรือเจ้าของ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <label
            htmlFor="stores-status-filter"
            className="mb-1 block text-xs font-medium text-muted"
          >
            กรองตามสถานะ
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StoreStatus | 'all')}
          >
            <SelectTrigger id="stores-status-filter">
              <SelectValue placeholder="ทุกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              {STORE_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'ทุกสถานะ' : labelStoreStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">
          {error instanceof Error ? error.message : 'โหลดร้านค้าไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading ? (
        <DataTable
          columns={columns}
          data={filteredStores}
          emptyMessage={search || statusFilter !== 'all' ? 'ไม่พบร้านค้า' : 'ไม่มีร้านค้า'}
          onRowClick={(store) => router.push(`/admin/stores/${store.id}`)}
        />
      ) : null}
    </div>
  );
}
