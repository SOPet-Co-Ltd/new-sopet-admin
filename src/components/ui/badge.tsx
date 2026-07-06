import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  draft: 'bg-surface text-muted border border-border',
  published: 'bg-success-bg text-success',
  archived: 'bg-warning-bg text-warning-text',
  pending_payment: 'bg-warning-bg text-warning-text',
  paid: 'bg-info-bg text-info-text',
  processing: 'bg-brand-tint text-brand',
  shipped: 'bg-brand-soft/50 text-brand-hover',
  delivered: 'bg-success-bg text-success',
  cancelled: 'bg-danger-bg text-danger',
  refunded: 'bg-surface text-muted border border-border',
};

export function Badge({
  children,
  status,
  className,
}: {
  children: ReactNode;
  status?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        status ? (statusStyles[status] ?? 'bg-surface text-muted') : 'bg-surface text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}
