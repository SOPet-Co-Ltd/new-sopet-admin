'use client';

import { TaxonomyDeleteButton } from '@/components/admin/taxonomy/taxonomy-delete-button';
import { Button } from '@/components/ui/button';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import type { TaxonomyItem } from '@/types';

export interface PendingPetTypeRowProps {
  item: TaxonomyItem;
  disabled?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingPetTypeRow({
  item,
  disabled = false,
  onApprove,
  onReject,
}: PendingPetTypeRowProps) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/50 px-4 py-3">
      <div>
        <p className="font-medium text-ink">{item.name}</p>
        <p className="text-xs text-muted">
          {item.slug} · {labelTaxonomyStatus(item.status)}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
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
        <TaxonomyDeleteButton item={item} kind="petType" disabled={disabled} />
      </div>
    </li>
  );
}
