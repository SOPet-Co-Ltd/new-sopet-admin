'use client';

import {
  taxonomyListItemMetaClassName,
  taxonomyPendingRowClassName,
} from '@/components/admin/taxonomy/taxonomy-hub-primitives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';
import type { TaxonomyItem } from '@/types';

export interface PendingTagRowProps {
  item: TaxonomyItem;
  disabled?: boolean;
  isNextUp?: boolean;
  approvePending?: boolean;
  rejectPending?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingTagRow({
  item,
  disabled = false,
  isNextUp = false,
  approvePending = false,
  rejectPending = false,
  onApprove,
  onReject,
}: PendingTagRowProps) {
  return (
    <li
      className={cn(
        taxonomyPendingRowClassName,
        'sm:items-center',
        isNextUp && 'border-brand/40 bg-brand-tint/50 ring-1 ring-brand/20',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-ink">{item.name}</p>
          {isNextUp ? (
            <Badge className="border border-brand/20 bg-brand-tint text-brand">ถัดไป</Badge>
          ) : null}
        </div>
        <p className={taxonomyListItemMetaClassName}>
          {item.slug} · {labelTaxonomyStatus(item.status)}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={disabled || approvePending}
          aria-busy={approvePending}
          className={cn(isNextUp && 'shadow-sm')}
          onClick={() => onApprove(item.id)}
        >
          อนุมัติ
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={disabled || rejectPending}
          aria-busy={rejectPending}
          onClick={() => onReject(item.id)}
        >
          ปฏิเสธ
        </Button>
      </div>
    </li>
  );
}
