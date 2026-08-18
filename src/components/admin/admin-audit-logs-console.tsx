'use client';

import { useId, useState, type ReactNode } from 'react';
import { HiChevronDown } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AUDIT_SEVERITY_LABELS,
  formatAuditActor,
  getAuditActionLabel,
  getAuditResourceLabel,
  getAuditSeverityBucket,
  parseComparableAuditPair,
  type AuditSeverityBucket,
} from '@/lib/audit-logs/labels';
import { cn, formatDateTime } from '@/lib/utils';
import type { AdminAuditLog } from '@/types';

const OVERFLOW_MAX_LINES = 24;
const OVERFLOW_MAX_LENGTH = 8192;
const SKELETON_ROW_COUNT = 16;
const NULL_DISPLAY = '—';

const SEVERITY_PILL_CLASS: Record<AuditSeverityBucket, string> = {
  success: 'bg-success-bg text-success-text',
  warning: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger dark:bg-danger-bg dark:text-white',
  info: 'bg-info-bg text-info-text',
};

const IDENTITY_FIELDS = [
  { key: 'actor', label: 'ผู้ทำรายการ' },
  { key: 'action', label: 'การกระทำ' },
  { key: 'resourceId', label: 'รหัสทรัพยากร' },
  { key: 'createdAt', label: 'เวลา' },
  { key: 'ipAddress', label: 'ที่อยู่ IP' },
  { key: 'requestId', label: 'รหัสคำขอ' },
  { key: 'metadata', label: 'ข้อมูลเพิ่มเติม' },
] as const;

export type AdminAuditLogsConsoleProps = {
  items: AdminAuditLog[];
  isLoading: boolean;
  isFetching: boolean;
  emptyMessage?: string;
};

function displayOrDash(value: string | null | undefined): string {
  return value == null || value === '' ? NULL_DISPLAY : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatDiffValue(value: unknown): string {
  if (value === undefined || value === null) return NULL_DISPLAY;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function prettyJsonLineCount(pretty: string): number {
  return pretty.length === 0 ? 0 : pretty.split('\n').length;
}

function exceedsOverflow(pretty: string): boolean {
  return prettyJsonLineCount(pretty) > OVERFLOW_MAX_LINES || pretty.length > OVERFLOW_MAX_LENGTH;
}

function previewPrettyJson(pretty: string): string {
  return pretty.split('\n').slice(0, OVERFLOW_MAX_LINES).join('\n');
}

function remainingRecord(
  parsed: Record<string, unknown>,
  consumedKeys: string[],
): Record<string, unknown> | null {
  const rest: Record<string, unknown> = { ...parsed };
  for (const key of consumedKeys) {
    delete rest[key];
  }
  return Object.keys(rest).length > 0 ? rest : null;
}

type ParsedMetadata = {
  parsed: unknown;
  pretty: string;
  pair: ReturnType<typeof parseComparableAuditPair>;
  remainingPretty: string;
};

function parseLogMetadata(metadata?: string | null): ParsedMetadata {
  if (!metadata) {
    return { parsed: null, pretty: '', pair: null, remainingPretty: '' };
  }

  try {
    const parsed: unknown = JSON.parse(metadata);
    const pretty = JSON.stringify(parsed, null, 2);
    if (!isRecord(parsed)) {
      return { parsed, pretty, pair: null, remainingPretty: pretty };
    }

    const pair = parseComparableAuditPair(parsed);
    if (!pair) {
      return { parsed, pretty, pair: null, remainingPretty: pretty };
    }

    const remaining = remainingRecord(parsed, pair.consumedKeys);
    return {
      parsed,
      pretty,
      pair,
      remainingPretty: remaining ? JSON.stringify(remaining, null, 2) : '',
    };
  } catch {
    return { parsed: null, pretty: metadata, pair: null, remainingPretty: metadata };
  }
}

function AuditLogSeverityCue({ action }: { action: string }) {
  const bucket = getAuditSeverityBucket(action);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
        SEVERITY_PILL_CLASS[bucket],
      )}
    >
      {AUDIT_SEVERITY_LABELS[bucket]}
    </span>
  );
}

function IdentityFields({ log, metadataSlot }: { log: AdminAuditLog; metadataSlot: ReactNode }) {
  const actionLabel = getAuditActionLabel(log.action);
  const values: Record<(typeof IDENTITY_FIELDS)[number]['key'], ReactNode> = {
    actor: formatAuditActor(log),
    action: (
      <span className="flex flex-col gap-0.5">
        <span>{actionLabel}</span>
        <span className="font-mono text-xs text-muted">{log.action}</span>
      </span>
    ),
    resourceId: displayOrDash(log.resourceId),
    createdAt: formatDateTime(log.createdAt),
    ipAddress: displayOrDash(log.ipAddress),
    requestId: displayOrDash(log.requestId),
    metadata: metadataSlot,
  };

  return (
    <dl className="grid gap-2 text-sm">
      {IDENTITY_FIELDS.map((field) => (
        <div key={field.key} className="grid gap-0.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-3">
          <dt className="text-xs text-muted">{field.label}</dt>
          <dd className="min-w-0 break-words text-ink">{values[field.key]}</dd>
        </div>
      ))}
    </dl>
  );
}

function ComparableDiff({
  before,
  after,
}: {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}) {
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-2 bg-surface/80 text-xs font-medium text-ink">
        <div className="border-r border-border px-3 py-1.5">ก่อน</div>
        <div className="px-3 py-1.5">หลัง</div>
      </div>
      {keys.map((key) => (
        <div key={key} className="grid grid-cols-2 border-t border-border text-xs">
          <div className="border-r border-border px-3 py-1.5 font-mono break-words">
            <span className="block text-[10px] text-muted">{key}</span>
            {formatDiffValue(before[key])}
          </div>
          <div className="px-3 py-1.5 font-mono break-words">
            <span className="block text-[10px] text-muted">{key}</span>
            {formatDiffValue(after[key])}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditLogOverflowDialog({
  log,
  pretty,
  open,
  onOpenChange,
}: {
  log: AdminAuditLog;
  pretty: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const actionLabel = getAuditActionLabel(log.action);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>รายละเอียดบันทึก</DialogTitle>
          <DialogDescription>
            {actionLabel} · {formatDateTime(log.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[46vh] space-y-3 overflow-auto">
          <IdentityFields
            log={log}
            metadataSlot={
              pretty ? (
                <pre className="overflow-auto font-mono text-xs">{pretty}</pre>
              ) : (
                NULL_DISPLAY
              )
            }
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              ปิด
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuditLogExpandedDetail({ log }: { log: AdminAuditLog }) {
  const [overflowOpen, setOverflowOpen] = useState(false);
  const parsed = parseLogMetadata(log.metadata);
  const jsonForOverflow = parsed.remainingPretty || parsed.pretty;
  const overflow = exceedsOverflow(jsonForOverflow);
  const jsonPreview = overflow ? previewPrettyJson(jsonForOverflow) : jsonForOverflow;
  const hasMetadataContent = Boolean(parsed.pair || jsonForOverflow);

  const metadataSlot = hasMetadataContent ? (
    <div className="space-y-2">
      {parsed.pair ? (
        <ComparableDiff before={parsed.pair.before} after={parsed.pair.after} />
      ) : null}
      {jsonForOverflow ? (
        <pre className="overflow-auto font-mono text-xs">{jsonPreview}</pre>
      ) : null}
      {overflow ? (
        <Button type="button" size="sm" variant="outline" onClick={() => setOverflowOpen(true)}>
          เปิดรายละเอียดทั้งหมด
        </Button>
      ) : null}
      <AuditLogOverflowDialog
        log={log}
        pretty={parsed.pretty || jsonForOverflow}
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
      />
    </div>
  ) : (
    NULL_DISPLAY
  );

  return (
    <div
      id={`audit-log-detail-${log.id}`}
      className="border-t border-border bg-surface/40 px-3 py-3"
    >
      <IdentityFields log={log} metadataSlot={metadataSlot} />
    </div>
  );
}

function AuditLogConsoleRow({
  log,
  expanded,
  onToggle,
}: {
  log: AdminAuditLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  const actionLabel = getAuditActionLabel(log.action);
  const actor = formatAuditActor(log);
  const resourceLabel = getAuditResourceLabel(log.resourceType);
  const timestamp = formatDateTime(log.createdAt);
  const accessibleName = `${expanded ? 'ย่อรายละเอียดบันทึก' : 'ขยายรายละเอียดบันทึก'}: ${actionLabel}`;
  const resourceTitle = log.resourceId ? `${resourceLabel} ${log.resourceId}` : resourceLabel;

  return (
    <div>
      <button
        type="button"
        className="flex w-full min-w-0 items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-expanded={expanded}
        aria-controls={`audit-log-detail-${log.id}`}
        aria-label={accessibleName}
        onClick={onToggle}
      >
        <time
          className="shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-muted"
          dateTime={log.createdAt}
          title={timestamp}
        >
          {timestamp}
        </time>
        <AuditLogSeverityCue action={log.action} />
        <span className="min-w-0 truncate font-medium text-ink" title={actionLabel}>
          {actionLabel}
        </span>
        <span className="min-w-0 truncate text-xs text-muted" title={actor}>
          {actor}
        </span>
        <span
          className="ml-auto min-w-0 max-w-[28%] truncate text-xs text-muted"
          title={resourceTitle}
        >
          {resourceLabel}
          {log.resourceId ? ` · ${log.resourceId}` : ''}
        </span>
        <HiChevronDown
          className={cn(
            'size-4 shrink-0 text-muted transition-transform',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {expanded ? <AuditLogExpandedDetail log={log} /> : null}
    </div>
  );
}

function ConsoleSkeletons() {
  return (
    <div
      className="divide-y divide-border"
      aria-busy="true"
      aria-label="กำลังโหลดบันทึกการใช้งาน"
      aria-live="polite"
    >
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className="flex items-center gap-2 px-3 py-1.5">
          <div className="h-3 w-28 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          <div className="h-4 w-12 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
          <div className="h-3 w-40 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}

export function AdminAuditLogsConsole({
  items,
  isLoading,
  isFetching,
  emptyMessage = 'ไม่พบบันทึกการใช้งาน',
}: AdminAuditLogsConsoleProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const statusId = useId();
  const expandedIdInItems = expandedId !== null && items.some((item) => item.id === expandedId);

  if (expandedId !== null && !expandedIdInItems) {
    setExpandedId(null);
  }

  const fetchStatus = isLoading
    ? 'กำลังโหลดบันทึกการใช้งาน'
    : isFetching
      ? 'กำลังอัปเดตบันทึกการใช้งาน'
      : items.length === 0
        ? ''
        : `${items.length} รายการ`;

  return (
    <section
      aria-label="บันทึกการใช้งาน"
      aria-busy={isFetching || undefined}
      aria-describedby={statusId}
      className={cn(
        'overflow-x-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-card)]',
        isFetching && !isLoading && 'opacity-80',
      )}
    >
      <p id={statusId} className="sr-only" aria-live="polite">
        {fetchStatus}
      </p>

      {isLoading ? <ConsoleSkeletons /> : null}

      {!isLoading && items.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted" role="status" aria-live="polite">
          {emptyMessage}
        </p>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <div className="divide-y divide-border">
          {items.map((log) => (
            <AuditLogConsoleRow
              key={log.id}
              log={log}
              expanded={expandedIdInItems && expandedId === log.id}
              onToggle={() => setExpandedId((current) => (current === log.id ? null : log.id))}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
