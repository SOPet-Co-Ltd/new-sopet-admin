'use client';

import { useCallback, useId, useMemo, useState, type ReactNode } from 'react';
import { HiChevronDown, HiOutlineFunnel } from 'react-icons/hi2';
import { AdminAuditLogsConsole } from '@/components/admin/admin-audit-logs-console';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminAuditLogs } from '@/hooks/useAdminAuditLogs';
import { AUDIT_ACTION_OPTIONS, AUDIT_RESOURCE_OPTIONS } from '@/lib/audit-logs/labels';
import { getErrorMessage } from '@/lib/api/errors';
import type { AdminAuditLogFilterInput } from '@/lib/graphql/generated/graphql';
import {
  parseDateParam,
  parseEnumParam,
  parsePageParam,
  parseSearchQuery,
  serializeDateParam,
  serializePageParam,
  serializeSearchQuery,
} from '@/lib/navigation/list-query-params';
import { useDebouncedSearchDraft } from '@/lib/navigation/use-debounced-search-draft';
import { useListQueryState, type ListQuerySpec } from '@/lib/navigation/use-list-query-state';
import { cn } from '@/lib/utils';

const ALL_FILTER = 'all';
const SEARCH_DEBOUNCE_MS = 300;
const AUDIT_ACTION_VALUES = AUDIT_ACTION_OPTIONS.map((option) => option.value);
const AUDIT_RESOURCE_VALUES = AUDIT_RESOURCE_OPTIONS.map((option) => option.value);

function FilterField({
  htmlFor,
  label,
  children,
  className,
}: {
  htmlFor: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Compile-time gate: true only when codegen includes AdminAuditLogFilterInput.requestId. */
type HasAdminAuditRequestIdFilter = 'requestId' extends keyof AdminAuditLogFilterInput
  ? true
  : false;

export const HAS_ADMIN_AUDIT_REQUEST_ID_FILTER: HasAdminAuditRequestIdFilter = true;

const adminAuditLogsQuerySpec = {
  page: { parse: parsePageParam, serialize: serializePageParam },
  q: { parse: parseSearchQuery, serialize: serializeSearchQuery },
  action: {
    parse: (raw: string | null) => {
      if (!raw) return '';
      return parseEnumParam(raw, AUDIT_ACTION_VALUES, '');
    },
    serialize: (value: string) => (value ? value : null),
  },
  resource: {
    parse: (raw: string | null) => {
      if (!raw) return '';
      return parseEnumParam(raw, AUDIT_RESOURCE_VALUES, '');
    },
    serialize: (value: string) => (value ? value : null),
  },
  from: { parse: parseDateParam, serialize: serializeDateParam },
  to: { parse: parseDateParam, serialize: serializeDateParam },
  requestId: { parse: parseSearchQuery, serialize: serializeSearchQuery },
} satisfies ListQuerySpec;

export default function AdminAuditLogsPage() {
  const filtersPanelId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [params, setParams] = useListQueryState(adminAuditLogsQuerySpec);
  const {
    page,
    q: search,
    action,
    resource: resourceType,
    from: fromDate,
    to: toDate,
    requestId,
  } = params;
  const commitSearch = useCallback((next: string) => setParams({ q: next }), [setParams]);
  const commitRequestId = useCallback(
    (next: string) => setParams({ requestId: next }),
    [setParams],
  );
  const [searchInput, setSearchInput] = useDebouncedSearchDraft(
    search,
    commitSearch,
    SEARCH_DEBOUNCE_MS,
  );
  const [requestIdInput, setRequestIdInput] = useDebouncedSearchDraft(
    requestId,
    commitRequestId,
    SEARCH_DEBOUNCE_MS,
  );

  const queryParams = useMemo(() => {
    const next: {
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

    if (search) next.search = search;
    if (action) next.action = action;
    if (resourceType) next.resourceType = resourceType;
    if (fromDate) next.fromDate = new Date(`${fromDate}T00:00:00`).toISOString();
    if (toDate) next.toDate = new Date(`${toDate}T23:59:59`).toISOString();
    if (HAS_ADMIN_AUDIT_REQUEST_ID_FILTER && requestId.trim()) {
      next.requestId = requestId.trim();
    }

    return next;
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
  const activeFilterCount = [
    search,
    HAS_ADMIN_AUDIT_REQUEST_ID_FILTER ? requestId.trim() : '',
    action,
    resourceType,
    fromDate,
    toDate,
  ].filter((value) => value.length > 0).length;

  return (
    <div>
      <PageHeader
        title="บันทึกการใช้งาน"
        description="ตรวจสอบกิจกรรมสำคัญของผู้ดูแล ผู้ขาย และระบบ"
      />

      <div
        className="mb-5 space-y-3 md:space-y-4"
        role="search"
        aria-label="ตัวกรองบันทึกการใช้งาน"
      >
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between md:hidden"
          aria-expanded={filtersOpen}
          aria-controls={filtersPanelId}
          aria-label={activeFilterCount > 0 ? `ตัวกรอง ${activeFilterCount} รายการ` : 'ตัวกรอง'}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <span className="inline-flex items-center gap-2" aria-hidden="true">
            <HiOutlineFunnel className="size-4" />
            ตัวกรอง
            {activeFilterCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </span>
          <HiChevronDown
            className={cn(
              'size-4 shrink-0 text-muted transition-transform duration-150 ease-out motion-reduce:transition-none',
              filtersOpen && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </Button>

        <div id={filtersPanelId} className={cn('space-y-4', !filtersOpen && 'max-md:hidden')}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <FilterField htmlFor="audit-log-search" label="ค้นหา" className="flex-1">
              <Input
                id="audit-log-search"
                type="search"
                aria-label="ค้นหาบันทึก"
                placeholder="ค้นหา..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
              />
            </FilterField>
            {HAS_ADMIN_AUDIT_REQUEST_ID_FILTER ? (
              <FilterField htmlFor="audit-log-request-id" label="รหัสคำขอ" className="lg:w-72">
                <Input
                  id="audit-log-request-id"
                  type="search"
                  aria-label="ค้นหาด้วยรหัสคำขอ"
                  placeholder="รหัสคำขอ..."
                  value={requestIdInput}
                  onChange={(e) => {
                    setRequestIdInput(e.target.value);
                  }}
                />
              </FilterField>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FilterField htmlFor="audit-log-action" label="การกระทำ">
              <Select
                value={action || ALL_FILTER}
                onValueChange={(value) => {
                  setParams({ action: value === ALL_FILTER ? '' : value });
                }}
              >
                <SelectTrigger
                  id="audit-log-action"
                  aria-label="กรองตามการกระทำ"
                  className="w-full"
                >
                  <SelectValue placeholder="ทุกการกระทำ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>ทุกการกระทำ</SelectItem>
                  {AUDIT_ACTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
            <FilterField htmlFor="audit-log-resource" label="ทรัพยากร">
              <Select
                value={resourceType || ALL_FILTER}
                onValueChange={(value) => {
                  setParams({ resource: value === ALL_FILTER ? '' : value });
                }}
              >
                <SelectTrigger
                  id="audit-log-resource"
                  aria-label="กรองตามทรัพยากร"
                  className="w-full"
                >
                  <SelectValue placeholder="ทุกทรัพยากร" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER}>ทุกทรัพยากร</SelectItem>
                  {AUDIT_RESOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>
            <FilterField htmlFor="audit-log-from" label="ตั้งแต่วันที่">
              <DatePicker
                id="audit-log-from"
                aria-label="ตั้งแต่วันที่"
                value={fromDate}
                onChange={(value) => {
                  setParams({ from: value });
                }}
                max={toDate || undefined}
                placeholder="เลือกวันที่"
              />
            </FilterField>
            <FilterField htmlFor="audit-log-to" label="ถึงวันที่">
              <DatePicker
                id="audit-log-to"
                aria-label="ถึงวันที่"
                value={toDate}
                onChange={(value) => {
                  setParams({ to: value });
                }}
                min={fromDate || undefined}
                placeholder="เลือกวันที่"
                align="end"
              />
            </FilterField>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-danger" role="alert">
          {getErrorMessage(error, 'โหลดบันทึกการใช้งานไม่สำเร็จ')}
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
              onClick={() => setParams((p) => ({ page: p.page - 1 }))}
            >
              ก่อนหน้า
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setParams((p) => ({ page: p.page + 1 }))}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
