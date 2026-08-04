function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface motion-reduce:animate-none ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export function VendorProductsListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดสินค้า">
      {/* Mobile card rows */}
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="flex items-start gap-3 px-4 py-3.5">
            <SkeletonBar className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBar className="h-4 w-2/3" />
              <SkeletonBar className="h-3 w-1/3" />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-full" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table skeleton */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-white md:block">
        <div className="border-b border-border bg-surface/60 px-4 py-3">
          <div className="flex gap-6">
            <SkeletonBar className="h-3 w-24" />
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="h-3 w-20" />
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="h-3 w-20" />
          </div>
        </div>
        <ul className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-4 px-4 py-3.5">
              <SkeletonBar className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBar className="h-4 w-48 max-w-full" />
                <SkeletonBar className="h-3 w-32 max-w-[50%]" />
              </div>
              <SkeletonBar className="hidden h-5 w-16 rounded-full sm:block" />
              <SkeletonBar className="hidden h-4 w-20 lg:block" />
              <SkeletonBar className="hidden h-4 w-12 xl:block" />
              <SkeletonBar className="h-8 w-8 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
