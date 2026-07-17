'use client';

import type { ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AnalyticsPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  error?: Error | null;
  loadingFallback?: ReactNode;
  className?: string;
};

export function AnalyticsPanel({
  title,
  description,
  children,
  loading = false,
  error = null,
  loadingFallback,
  className,
}: AnalyticsPanelProps) {
  return (
    <Card className={cn('min-w-0', className)}>
      <CardHeader>
        <h3 className="font-medium text-ink">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardBody className="min-w-0">
        {loading ? loadingFallback : null}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error.message || 'โหลดข้อมูลไม่สำเร็จ'}
          </p>
        ) : null}
        {!loading && !error ? children : null}
      </CardBody>
    </Card>
  );
}
