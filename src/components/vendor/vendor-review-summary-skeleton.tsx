export function VendorReviewSummarySkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <div className="h-28 animate-pulse rounded-xl bg-surface" />
        <div className="h-28 animate-pulse rounded-xl bg-surface" />
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-surface lg:col-span-1" />
    </div>
  );
}
