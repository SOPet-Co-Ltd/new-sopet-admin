export function StoresListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดร้านค้า">
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-36 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
              <div className="h-3 w-44 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
              <div className="h-3 w-24 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
            </div>
            <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] md:block">
        <div className="border-b border-border bg-surface/60 px-4 py-3">
          <div className="flex gap-8">
            <div className="h-4 w-20 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-4 w-14 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
        </div>
        <ul className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-4 px-4 py-3.5">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-40 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
                <div className="h-3 w-48 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
              </div>
              <div className="hidden h-4 w-28 animate-pulse rounded bg-surface motion-reduce:animate-none md:block" />
              <div className="h-5 w-16 shrink-0 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
              <div className="hidden h-4 w-24 shrink-0 animate-pulse rounded bg-surface motion-reduce:animate-none md:block" />
              <div className="h-8 w-16 shrink-0 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only">กำลังโหลดร้านค้า...</span>
    </div>
  );
}
