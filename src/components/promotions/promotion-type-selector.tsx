'use client';

import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import { promotionTypeMeta, type PromotionTypeSlug } from '@/lib/promotions/metadata';
import { cn } from '@/lib/utils';

const TYPE_GROUPS: ReadonlyArray<{
  id: string;
  label: string;
  types: readonly PromotionTypeSlug[];
}> = [
  {
    id: 'product',
    label: 'ส่วนลดสินค้า',
    types: ['percentage', 'fixed_amount', 'buy_x_get_y'],
  },
  {
    id: 'shipping',
    label: 'ค่าจัดส่ง',
    types: ['free_shipping', 'fixed_shipping_discount', 'percentage_shipping_discount'],
  },
];

export function PromotionTypeSelector({
  basePath,
}: {
  basePath: '/vendor/promotions/new' | '/admin/promotions/new';
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {TYPE_GROUPS.map((group) => {
        const headingId = `promo-type-group-${group.id}`;
        return (
          <section key={group.id} aria-labelledby={headingId} className="space-y-3">
            <h2 id={headingId} className="text-sm font-medium text-muted-foreground">
              {group.label}
            </h2>
            <ul className="space-y-2">
              {group.types.map((type) => {
                const meta = promotionTypeMeta[type];
                return (
                  <li key={type}>
                    <Link
                      href={`${basePath}/${type}`}
                      className={cn(
                        'group flex min-h-11 items-start justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5',
                        'transition-[border-color,background-color,color] duration-200 ease-out',
                        'hover:border-brand/30 hover:bg-brand-tint/25',
                        'focus-visible:border-brand/40 focus-visible:bg-brand-tint/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                        'active:bg-brand-tint/40',
                        'motion-reduce:transition-none',
                      )}
                    >
                      <span className="min-w-0 space-y-1">
                        <span className="block text-balance font-medium text-ink">
                          {meta.label}
                        </span>
                        <span className="block text-pretty text-sm text-muted-foreground">
                          {meta.description}
                        </span>
                      </span>
                      <HiArrowRight
                        className="mt-1 size-4 shrink-0 text-muted transition-colors duration-200 ease-out group-hover:text-brand group-focus-visible:text-brand motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
