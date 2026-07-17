function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface motion-reduce:animate-none ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export function VendorPromotionsListSkeleton() {
  return (
    <ul
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white"
      aria-busy="true"
      aria-label="กำลังโหลดโปรโมชัน"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <li
          key={index}
          className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonBar className="h-4 w-40 max-w-full" />
              <SkeletonBar className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonBar className="h-3 w-56 max-w-full" />
            <SkeletonBar className="h-3 w-32 max-w-[40%]" />
          </div>
          <div className="flex shrink-0 gap-2">
            <SkeletonBar className="h-8 w-20 rounded-md" />
            <SkeletonBar className="h-8 w-14 rounded-md" />
            <SkeletonBar className="h-8 w-12 rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}
