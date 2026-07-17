import type { ReactNode } from 'react';

type PlatformRankedListItem = {
  key: string;
  primary: ReactNode;
  secondary: ReactNode;
};

type PlatformRankedListProps = {
  items: PlatformRankedListItem[];
  loading?: boolean;
};

function RankedListSkeleton() {
  return (
    <ul className="space-y-2" aria-busy="true" aria-label="กำลังโหลดรายการ">
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="size-7 shrink-0 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
            <div className="h-4 w-40 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
          <div className="space-y-1.5">
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-3 w-20 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
        </li>
      ))}
      <span className="sr-only">กำลังโหลดรายการ...</span>
    </ul>
  );
}

export function PlatformRankedList({ items, loading = false }: PlatformRankedListProps) {
  if (loading) {
    return <RankedListSkeleton />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลในช่วงเวลานี้</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item.key}
          className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-medium tabular-nums text-muted-foreground"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div className="min-w-0">{item.primary}</div>
          </div>
          <div className="shrink-0 text-right text-sm">{item.secondary}</div>
        </li>
      ))}
    </ul>
  );
}
