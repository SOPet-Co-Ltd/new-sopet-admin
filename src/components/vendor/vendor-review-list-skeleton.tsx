function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface motion-reduce:animate-none ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export function VendorReviewListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="กำลังโหลดรายการรีวิว">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <SkeletonBar className="h-16 w-16 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-2">
                <SkeletonBar className="h-4 w-40 max-w-full" />
                <SkeletonBar className="h-3 w-24" />
              </div>
              <SkeletonBar className="h-5 w-20 rounded-full" />
            </div>
            <SkeletonBar className="h-12 w-full" />
            <SkeletonBar className="h-8 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
