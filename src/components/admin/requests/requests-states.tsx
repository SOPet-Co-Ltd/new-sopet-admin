import type { ReactNode } from 'react';
import { HiCheckCircle, HiInboxArrowDown } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RequestsListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลดรายการคำขอ">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-40 max-w-full animate-pulse rounded bg-surface" />
              <div className="h-3 w-56 max-w-full animate-pulse rounded bg-surface" />
            </div>
            <div className="h-6 w-20 shrink-0 animate-pulse rounded-full bg-surface" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-primary-tint" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RequestsEmptyState({
  title,
  description,
  variant = 'neutral',
  action,
}: {
  title: string;
  description: string;
  variant?: 'neutral' | 'success';
  action?: ReactNode;
}) {
  const isSuccess = variant === 'success';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border px-6 py-12 text-center',
        isSuccess
          ? 'border-success/20 bg-success-bg/30'
          : 'border-border bg-card shadow-[var(--shadow-card)]',
      )}
    >
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          isSuccess ? 'bg-success/15 text-success' : 'bg-surface text-muted-foreground',
        )}
        aria-hidden="true"
      >
        {isSuccess ? <HiCheckCircle className="size-6" /> : <HiInboxArrowDown className="size-6" />}
      </div>
      <p className="mt-4 font-medium text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function RequestsTabSwitchButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}
