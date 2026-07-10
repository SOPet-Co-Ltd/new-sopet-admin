import { Card, CardBody } from '@/components/ui/card';

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
