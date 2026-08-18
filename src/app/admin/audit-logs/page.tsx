'use client';

import { useMemo, useState } from 'react';
import { AdminAuditLogsConsole } from '@/components/admin/admin-audit-logs-console';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminAuditLogs } from '@/hooks/useAdminAuditLogs';
import { AUDIT_ACTION_OPTIONS, AUDIT_RESOURCE_OPTIONS } from '@/lib/audit-logs/labels';
import type { AdminAuditLogFilterInput } from '@/lib/graphql/generated/graphql';

/** Compile-time gate: true only when codegen includes AdminAuditLogFilterInput.requestId. */
type HasAdminAuditRequestIdFilter = 'requestId' extends keyof AdminAuditLogFilterInput
  ? true
  : false;

export const HAS_ADMIN_AUDIT_REQUEST_ID_FILTER: HasAdminAuditRequestIdFilter = true;

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [requestId, setRequestId] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const params: {
      page: number;
      limit: 20;
      search?: string;
      action?: string;
      resourceType?: string;
      fromDate?: string;
      toDate?: string;
      requestId?: string;
    } = {
      page,
      limit: 20,
    };

    if (search) params.search = search;
    if (action) params.action = action;
    if (resourceType) params.resourceType = resourceType;
    if (fromDate) params.fromDate = new Date(`${fromDate}T00:00:00`).toISOString();
    if (toDate) params.toDate = new Date(`${toDate}T23:59:59`).toISOString();
    if (HAS_ADMIN_AUDIT_REQUEST_ID_FILTER && requestId.trim()) {
      params.requestId = requestId.trim();
    }

    return params;
  }, [search, action, resourceType, fromDate, toDate, requestId, page]);

  const consoleRemountKey = JSON.stringify({
    search,
    action,
    resourceType,
    fromDate,
    toDate,
    page,
    requestId: HAS_ADMIN_AUDIT_REQUEST_ID_FILTER ? requestId : '',
  });

  const { data, isLoading, isFetching, error } = useAdminAuditLogs(queryParams);

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

      {HAS_ADMIN_AUDIT_REQUEST_ID_FILTER ? (
        <div className="mb-5">
          <Input
            type="search"
            aria-label="ค้นหาด้วยรหัสคำขอ"
            placeholder="รหัสคำขอ..."
            value={requestId}
            onChange={(e) => {
              setRequestId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error instanceof Error ? error.message : 'โหลดบันทึกการใช้งานไม่สำเร็จ'}
        </p>
      ) : null}

      <AdminAuditLogsConsole
        key={consoleRemountKey}
        items={logs}
        isLoading={isLoading}
        isFetching={isFetching}
      />

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            หน้า {pagination.page} จาก {pagination.totalPages} (ทั้งหมด {pagination.total} รายการ)
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
    </div>
  );
}
