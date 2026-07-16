export function SalesOverTimeChartSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดกราฟยอดขาย">
      <div className="flex h-48 items-end gap-1">
        {Array.from({ length: 14 }).map((_, index) => (
          <div
            key={index}
            className="flex-1 animate-pulse rounded-t-md bg-surface motion-reduce:animate-none"
            style={{ height: `${20 + (index % 5) * 12}%` }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-3 flex-1 animate-pulse rounded bg-surface motion-reduce:animate-none"
          />
        ))}
      </div>
      <span className="sr-only">กำลังโหลดกราฟยอดขาย...</span>
    </div>
  );
}

export function BreakdownChartSkeleton() {
  return (
    <ul className="space-y-3" aria-busy="true" aria-label="กำลังโหลดกราฟสัดส่วน">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index}>
          <div className="mb-1 flex items-center justify-between gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
          <div className="h-2 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
        </li>
      ))}
      <span className="sr-only">กำลังโหลดกราฟสัดส่วน...</span>
    </ul>
  );
}
