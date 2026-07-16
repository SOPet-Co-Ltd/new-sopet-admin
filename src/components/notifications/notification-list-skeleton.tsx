export function NotificationListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดการแจ้งเตือน">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-4" aria-hidden="true">
          <div className="flex items-start gap-3">
            <div className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <div className="h-4 w-40 max-w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
              </div>
              <div className="h-4 w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
              <div className="h-3 w-28 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
