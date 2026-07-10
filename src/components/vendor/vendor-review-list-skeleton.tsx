export function VendorReviewListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-4 rounded-xl border border-border bg-card p-5">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-surface" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-surface" />
            <div className="h-12 animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
