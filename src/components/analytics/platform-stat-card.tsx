import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PlatformStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
};

export function PlatformStatCard({ label, value, hint, href }: PlatformStatCardProps) {
  const body = (
    <>
      <p className="min-w-0 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl transition-colors hover:ring-2 hover:ring-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Card className="h-full">
          <CardBody>{body}</CardBody>
        </Card>
      </Link>
    );
  }

  return (
    <Card>
      <CardBody>{body}</CardBody>
    </Card>
  );
}

export function PlatformStatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy="true"
      aria-label="กำลังโหลดตัวเลขสรุป"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]')}
        >
          <div className="h-4 w-24 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
          <div className="mt-3 h-8 w-32 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
        </div>
      ))}
      <span className="sr-only">กำลังโหลดตัวเลขสรุป...</span>
    </div>
  );
}
