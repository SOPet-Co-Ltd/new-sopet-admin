'use client';

import { useId, useMemo, useState } from 'react';
import { HiChevronDown, HiChevronRight, HiOutlineDocumentText } from 'react-icons/hi2';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import {
  ERROR_CATALOG,
  matchesErrorCatalogQuery,
  type ErrorCatalogEntry,
} from '@/lib/api/error-messages';
import { cn } from '@/lib/utils';

const GROUP_ORDER = [
  'ทั่วไป / ระบบ',
  'การยืนยันตัวตน / สิทธิ์',
  'ตะกร้า / เช็คเอาต์',
  'คำสั่งซื้อ / การชำระเงิน / โอนเงิน',
  'โปรโมชัน / แคมเปญ',
  'แคตตาล็อก / อนุกรมวิธาน',
  'บัญชี / ร้าน / ทีม',
  'อีเมล CMS / รีวิว',
] as const;

type CatalogGroup = (typeof GROUP_ORDER)[number];

const GROUP_CHIP_LABEL: Record<CatalogGroup, string> = {
  'ทั่วไป / ระบบ': 'ทั่วไป',
  'การยืนยันตัวตน / สิทธิ์': 'สิทธิ์',
  'ตะกร้า / เช็คเอาต์': 'ตะกร้า',
  'คำสั่งซื้อ / การชำระเงิน / โอนเงิน': 'คำสั่งซื้อ',
  'โปรโมชัน / แคมเปญ': 'โปรโมชัน',
  'แคตตาล็อก / อนุกรมวิธาน': 'แคตตาล็อก',
  'บัญชี / ร้าน / ทีม': 'บัญชี',
  'อีเมล CMS / รีวิว': 'อีเมล / รีวิว',
};

const ALL_GROUPS = 'all' as const;
type GroupFilter = typeof ALL_GROUPS | CatalogGroup;

function entryHasDocs(entry: ErrorCatalogEntry): boolean {
  return Boolean(entry.why || entry.possibleIssue || entry.howToFix);
}

function CatalogDocField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm leading-relaxed text-ink">{value}</dd>
    </div>
  );
}

function CatalogEntryRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: ErrorCatalogEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const detailId = useId();
  const hasDocs = entryHasDocs(entry);
  const accessibleName = `${expanded ? 'ย่อคำอธิบาย' : 'ขยายคำอธิบาย'}: ${entry.code}`;

  const rowBody = (
    <>
      <div className="min-w-0 flex-1 space-y-1.5 overflow-hidden">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <code className="max-w-full break-all rounded-md bg-surface px-2 py-0.5 font-mono text-[13px] font-semibold tracking-tight text-ink">
            {entry.code}
          </code>
          {hasDocs ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground" aria-hidden="true">
              <HiOutlineDocumentText className="size-3.5 shrink-0" aria-hidden="true" />
              มีคำอธิบาย
            </span>
          ) : null}
        </div>
        <p className="break-words text-sm leading-relaxed text-muted-foreground">{entry.message}</p>
      </div>
      {hasDocs ? (
        <HiChevronDown
          className={cn(
            'mt-1 size-4 shrink-0 text-muted transition-transform',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  return (
    <li className="min-w-0 border-b border-border/80 last:border-b-0">
      {hasDocs ? (
        <button
          type="button"
          className="flex w-full min-w-0 items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-surface/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-inset"
          aria-expanded={expanded}
          aria-controls={detailId}
          aria-label={accessibleName}
          onClick={onToggle}
        >
          {rowBody}
        </button>
      ) : (
        <div className="flex min-w-0 items-start gap-3 px-4 py-4">{rowBody}</div>
      )}

      {hasDocs && expanded ? (
        <dl
          id={detailId}
          className="grid min-w-0 gap-5 border-t border-border/70 bg-surface/40 px-4 py-4 sm:grid-cols-3 sm:gap-6"
        >
          {entry.why ? <CatalogDocField label="สาเหตุ" value={entry.why} /> : null}
          {entry.possibleIssue ? (
            <CatalogDocField label="ปัญหาที่เป็นไปได้" value={entry.possibleIssue} />
          ) : null}
          {entry.howToFix ? <CatalogDocField label="วิธีแก้ไข" value={entry.howToFix} /> : null}
        </dl>
      ) : null}
    </li>
  );
}

function GroupSection({
  group,
  entries,
  collapsed,
  onToggleGroup,
  expandedCodes,
  onToggleEntry,
}: {
  group: CatalogGroup;
  entries: ErrorCatalogEntry[];
  collapsed: boolean;
  onToggleGroup: () => void;
  expandedCodes: Set<string>;
  onToggleEntry: (code: string) => void;
}) {
  const headingId = `error-group-${group}`;

  return (
    <section aria-labelledby={headingId} className="min-w-0 scroll-mt-28">
      <button
        type="button"
        id={headingId}
        className="mb-2 flex w-full min-w-0 items-center gap-2 rounded-lg px-1 py-2 text-left transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-expanded={!collapsed}
        onClick={onToggleGroup}
      >
        <HiChevronRight
          className={cn(
            'size-4 shrink-0 text-muted transition-transform',
            !collapsed && 'rotate-90',
          )}
          aria-hidden="true"
        />
        <h2 className="min-w-0 flex-1 break-words font-display text-base font-medium text-ink">
          {group}
        </h2>
        <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {entries.length}
        </span>
      </button>

      {!collapsed ? (
        <ul className="min-w-0 overflow-hidden rounded-xl border border-border bg-white">
          {entries.map((entry) => (
            <CatalogEntryRow
              key={entry.code}
              entry={entry}
              expanded={expandedCodes.has(entry.code)}
              onToggle={() => onToggleEntry(entry.code)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function ErrorMessagesCatalogPage() {
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>(ALL_GROUPS);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(() => new Set());

  const groupTotals = useMemo(() => {
    const totals = Object.fromEntries(GROUP_ORDER.map((group) => [group, 0])) as Record<
      CatalogGroup,
      number
    >;
    for (const entry of ERROR_CATALOG) {
      if (entry.group in totals) {
        totals[entry.group as CatalogGroup] += 1;
      }
    }
    return totals;
  }, []);

  const filtered = useMemo(() => {
    const byQuery = ERROR_CATALOG.filter((entry) => matchesErrorCatalogQuery(entry, query));
    if (groupFilter === ALL_GROUPS) return byQuery;
    return byQuery.filter((entry) => entry.group === groupFilter);
  }, [query, groupFilter]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        entries: filtered.filter((entry) => entry.group === group),
      })).filter((section) => section.entries.length > 0),
    [filtered],
  );

  const trimmedQuery = query.trim();
  const resultCount = filtered.length;
  const isFiltering = Boolean(trimmedQuery) || groupFilter !== ALL_GROUPS;

  function toggleGroupCollapsed(group: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  function toggleEntryExpanded(code: string) {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function selectGroup(next: GroupFilter) {
    setGroupFilter(next);
    // Opening a single group should show its rows immediately.
    if (next !== ALL_GROUPS) {
      setCollapsedGroups((prev) => {
        if (!prev.has(next)) return prev;
        const cleared = new Set(prev);
        cleared.delete(next);
        return cleared;
      });
    }
  }

  return (
    <main className="min-w-0">
      <header className="mx-auto mb-8 w-full min-w-0 max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <h1 className="max-w-2xl break-words font-display text-3xl font-medium tracking-tight text-ink">
              รหัสข้อผิดพลาด
            </h1>
            <p className="max-w-2xl break-words text-sm leading-relaxed text-muted-foreground">
              ค้นหารหัส API แล้วดูข้อความภาษาไทยที่แสดงในแอดมิน / ผู้ขาย กดแถวที่มีคำอธิบายเพื่อดูสาเหตุ
              และวิธีแก้ไข
            </p>
          </div>
          <ThemeToggle className="shrink-0" />
        </div>
      </header>

      <div
        data-testid="error-catalog-sticky-toolbar"
        className="sticky top-0 z-10 mb-8 min-w-0 border-b border-brand-soft bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90"
      >
        <div className="mx-auto w-full min-w-0 max-w-5xl space-y-3 px-4 py-4 sm:px-6 lg:px-8">
          <label htmlFor="error-catalog-search" className="sr-only">
            ค้นหารหัสหรือข้อความข้อผิดพลาด
          </label>
          <Input
            id="error-catalog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหารหัส, ข้อความไทย, สาเหตุ…"
            autoComplete="off"
            autoFocus
            className="h-11 min-w-0 max-w-full"
          />

          <div
            className="min-w-0 max-w-full touch-pan-x overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="กรองตามกลุ่ม"
            data-testid="error-catalog-group-filters"
          >
            <div className="flex w-max gap-2">
              <GroupFilterChip
                selected={groupFilter === ALL_GROUPS}
                onSelect={() => selectGroup(ALL_GROUPS)}
                label="ทั้งหมด"
                count={ERROR_CATALOG.length}
              />
              {GROUP_ORDER.map((group) => (
                <GroupFilterChip
                  key={group}
                  selected={groupFilter === group}
                  onSelect={() => selectGroup(group)}
                  label={GROUP_CHIP_LABEL[group]}
                  count={groupTotals[group]}
                  title={group}
                />
              ))}
            </div>
          </div>

          <p
            className={cn(
              'text-sm tabular-nums',
              isFiltering ? 'font-medium text-brand' : 'text-muted-foreground',
            )}
            aria-live="polite"
          >
            {isFiltering
              ? `พบ ${resultCount} รายการจาก ${ERROR_CATALOG.length}`
              : `${ERROR_CATALOG.length} รหัสทั้งหมด`}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
            <p className="break-words text-sm text-muted-foreground">
              ไม่พบรหัสที่ตรงกับ &ldquo;
              {trimmedQuery ||
                (groupFilter !== ALL_GROUPS ? GROUP_CHIP_LABEL[groupFilter] : 'เงื่อนไขนี้')}
              &rdquo;
            </p>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              onClick={() => {
                setQuery('');
                setGroupFilter(ALL_GROUPS);
              }}
            >
              ล้างการค้นหาและตัวกรอง
            </button>
          </div>
        ) : (
          <div className="min-w-0 space-y-8">
            {grouped.map((section) => (
              <GroupSection
                key={section.group}
                group={section.group}
                entries={section.entries}
                collapsed={collapsedGroups.has(section.group)}
                onToggleGroup={() => toggleGroupCollapsed(section.group)}
                expandedCodes={expandedCodes}
                onToggleEntry={toggleEntryExpanded}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function GroupFilterChip({
  selected,
  onSelect,
  label,
  count,
  title,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  count: number;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      title={title}
      onClick={onSelect}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        selected
          ? 'border-brand bg-brand-tint text-brand'
          : 'border-border bg-card text-ink hover:border-brand/30 hover:bg-brand-tint/60',
      )}
    >
      <span className="font-medium">{label}</span>
      <span
        className={cn(
          'rounded-md px-1 tabular-nums',
          selected ? 'bg-brand/15 text-brand' : 'text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  );
}
