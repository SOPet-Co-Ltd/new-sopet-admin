'use client';

export function StockPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-surface motion-safe:animate-pulse" />
        <div className="h-8 w-56 rounded bg-surface motion-safe:animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded bg-surface motion-safe:animate-pulse" />
      </div>
      <div className="h-28 rounded-xl border border-border bg-surface/80 motion-safe:animate-pulse" />
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="h-5 w-48 rounded bg-surface motion-safe:animate-pulse" />
        <div className="h-24 rounded-lg bg-surface motion-safe:animate-pulse" />
        <div className="h-24 rounded-lg bg-surface motion-safe:animate-pulse" />
      </div>
      <span className="sr-only">กำลังโหลดสินค้า...</span>
    </div>
  );
}
