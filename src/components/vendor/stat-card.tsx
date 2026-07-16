import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardBody } from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  href?: string;
};

export function StatCard({ label, value, hint, icon, href }: StatCardProps) {
  const body = (
    <>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="min-w-0 text-sm text-muted">{label}</p>
        {icon ? <div className="shrink-0 rounded-lg bg-brand-tint p-2">{icon}</div> : null}
      </div>
      <p className="mt-2 break-words text-xl font-semibold tabular-nums text-ink sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl transition-colors hover:ring-2 hover:ring-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
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
