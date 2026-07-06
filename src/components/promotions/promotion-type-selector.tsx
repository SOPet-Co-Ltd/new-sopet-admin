'use client';

import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/card';
import { PROMOTION_TYPES, promotionTypeMeta } from '@/lib/promotions/metadata';
import { cn } from '@/lib/utils';

export function PromotionTypeSelector({
  basePath,
}: {
  basePath: '/vendor/promotions/new' | '/admin/promotions/new';
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PROMOTION_TYPES.map((type) => {
        const meta = promotionTypeMeta[type];
        return (
          <Link
            key={type}
            href={`${basePath}/${type}`}
            className="group block"
            aria-label={`${meta.label}: ${meta.description}`}
          >
            <Card
              className={cn(
                'h-full transition-all',
                'group-hover:border-brand/40 group-hover:shadow-md',
              )}
            >
              <CardBody className="space-y-2">
                <p className="font-display font-medium text-ink">{meta.label}</p>
                <p className="text-sm text-muted">{meta.description}</p>
              </CardBody>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
