import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  draft: 'bg-surface text-muted-foreground border border-border',
  published: 'bg-success-bg text-success',
  archived: 'bg-warning-bg text-warning-text',
  pending_payment: 'bg-warning-bg text-warning-text',
  paid: 'bg-info-bg text-info-text',
  processing: 'bg-brand-tint text-brand',
  shipped: 'bg-brand-soft/50 text-brand-hover',
  delivered: 'bg-success-bg text-success',
  cancelled: 'bg-danger-bg text-danger',
  refunded: 'bg-danger-bg text-danger',
};

export function Badge({
  children,
  status,
  className,
  ...props
}: {
  children: ReactNode;
  status?: string;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-testid="badge"
      className={cn(
        'inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-normal',
        status
          ? (statusStyles[status] ?? 'bg-surface text-muted-foreground')
          : 'bg-surface text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
