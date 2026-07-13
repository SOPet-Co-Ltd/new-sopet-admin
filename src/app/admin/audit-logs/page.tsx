'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { useAdminAuditLogs } from '@/hooks/useAdminAuditLogs';
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_RESOURCE_OPTIONS,
  formatAuditActor,
  formatAuditMetadata,
  getAuditActionLabel,
  getAuditResourceLabel,
} from '@/lib/audit-logs/labels';
import type { AdminAuditLog } from '@/types';

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      action: action || undefined,
      resourceType: resourceType || undefined,
      fromDate: fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined,
      toDate: toDate ? new Date(`${toDate}T23:59:59`).toISOString() : undefined,
      page,
      limit: 20,
    }),
    [search, action, resourceType, fromDate, toDate, page],
  );

  const { data, isLoading, error } = useAdminAuditLogs(queryParams);

  const columns = useMemo<ColumnDef<AdminAuditLog>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'เวลา',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actor',
        header: 'ผู้ทำรายการ',
        cell: ({ row }) => (
          <span className="text-sm text-ink">{formatAuditActor(row.original)}</span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'การกระทำ',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-ink">
            {getAuditActionLabel(row.original.action)}
          </span>
        ),
      },
      {
        id: 'resource',
        header: 'ทรัพยากร',
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="text-ink">{getAuditResourceLabel(row.original.resourceType)}</p>
            {row.original.resourceId ? (
              <p className="truncate text-xs text-muted">{row.original.resourceId}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'details',
        header: 'รายละเอียด',
        cell: ({ row }) => (
          <span className="line-clamp-2 text-sm text-muted">
            {formatAuditMetadata(row.original.metadata)}
          </span>
        ),
        meta: { className: 'hidden lg:table-cell max-w-xs' },
      },
    ],
    [],
  );

  const pagination = data?.pagination;
  const logs = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="บันทึกการใช้งาน"
        description="ตรวจสอบกิจกรรมสำคัญของผู้ดูแล ผู้ขาย และระบบ"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          type="search"
          aria-label="ค้นหาบันทึก"
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="กรองตามการกระทำ"
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-ink"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          <option value="">ทุกการกระทำ</option>
          {AUDIT_ACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label="กรองตามทรัพยากร"
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-ink"
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">ทุกทรัพยากร</option>
          {AUDIT_RESOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Input
          type="date"
          aria-label="ตั้งแต่วันที่"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          aria-label="ถึงวันที่"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">
          {error instanceof Error ? error.message : 'โหลดบันทึกการใช้งานไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading ? (
        <>
          <DataTable columns={columns} data={logs} emptyMessage="ไม่พบบันทึกการใช้งาน" />
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
