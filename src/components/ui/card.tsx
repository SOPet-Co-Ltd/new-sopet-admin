import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  role,
}: {
  className?: string;
  children: React.ReactNode;
  role?: React.AriaRole;
}) {
  return (
    <div
      role={role}
      className={cn(
        'min-w-0 rounded-xl border border-border bg-card shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('border-b border-border px-5 py-4', className)}>{children}</div>;
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  back?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {back ? <div className="mb-3">{back}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-balance break-words text-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
