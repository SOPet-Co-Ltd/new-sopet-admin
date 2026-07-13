import type { ReactNode } from 'react';
import { Card, CardBody } from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted">{label}</p>
          {icon ? <div className="shrink-0 rounded-lg bg-brand-tint p-2">{icon}</div> : null}
        </div>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
