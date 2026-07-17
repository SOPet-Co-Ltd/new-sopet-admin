import { cn } from '@/lib/utils';

export function ListRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-[4.5rem] animate-pulse rounded-lg border border-border bg-surface motion-reduce:animate-none"
        />
      ))}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      <div className="h-9 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-md border border-border bg-surface/80 motion-reduce:animate-none"
        />
      ))}
      <span className="sr-only">กำลังโหลดตาราง...</span>
    </div>
  );
}

export function TaxonomyTabCount({ count, selected }: { count: number; selected: boolean }) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums',
        selected ? 'bg-white/20 text-white' : 'bg-warning-bg text-warning-text',
      )}
      aria-label={`${count.toLocaleString('th-TH')} รายการรออนุมัติ`}
    >
      {count.toLocaleString('th-TH')}
    </span>
  );
}

export const taxonomyPendingRowClassName =
  'flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 motion-reduce:transition-none sm:flex-row sm:items-start sm:justify-between';

export const taxonomyListItemMetaClassName = 'truncate text-xs text-muted-foreground';
