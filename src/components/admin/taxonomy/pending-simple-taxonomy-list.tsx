'use client';

import { TaxonomyDeleteButton } from '@/components/admin/taxonomy/taxonomy-delete-button';
import type { TaxonomyDeleteKind } from '@/components/admin/taxonomy/taxonomy-delete-dialog';
import {
  ListRowSkeleton,
  taxonomyListItemMetaClassName,
  taxonomyPendingRowClassName,
} from '@/components/admin/taxonomy/taxonomy-hub-primitives';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import type { TaxonomyItem } from '@/types';

export interface PendingSimpleTaxonomyListProps {
  title: string;
  emptyMessage?: string;
  items: TaxonomyItem[];
  kind: TaxonomyDeleteKind;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PendingSimpleTaxonomyList({
  title,
  emptyMessage = 'ไม่มีรายการรออนุมัติ',
  items,
  kind,
  onApprove,
  onReject,
  disabled = false,
  isLoading = false,
}: PendingSimpleTaxonomyListProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display font-medium text-balance text-ink">
          {title}
          {!isLoading && !disabled ? (
            <span
              aria-hidden="true"
              className="ml-1.5 text-base font-normal text-muted-foreground tabular-nums"
            >
              ({items.length.toLocaleString('th-TH')})
            </span>
          ) : null}
        </h2>
      </CardHeader>
      <CardBody className="space-y-3">
        {isLoading ? (
          <ListRowSkeleton rows={2} />
        ) : items.length === 0 ? (
          <p className="text-sm text-pretty text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className={taxonomyPendingRowClassName}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{item.name}</p>
                  <p className={taxonomyListItemMetaClassName}>
                    {item.slug} · {labelTaxonomyStatus(item.status)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={disabled}
                    aria-busy={disabled}
                    onClick={() => onApprove(item.id)}
                  >
                    อนุมัติ
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={disabled}
                    aria-busy={disabled}
                    onClick={() => onReject(item.id)}
                  >
                    ปฏิเสธ
                  </Button>
                  <TaxonomyDeleteButton item={item} kind={kind} disabled={disabled} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
