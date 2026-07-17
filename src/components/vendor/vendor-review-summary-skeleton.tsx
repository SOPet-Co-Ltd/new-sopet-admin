function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface motion-reduce:animate-none ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export function VendorReviewSummarySkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-5" aria-busy="true" aria-label="กำลังโหลดสรุปรีวิว">
      <SkeletonBlock className="h-28 lg:col-span-2" />
      <SkeletonBlock className="h-40 lg:col-span-3" />
    </div>
  );
}
