'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { TaxonomyDeleteButton } from '@/components/admin/taxonomy/taxonomy-delete-button';
import { useSetPetTypeImage } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
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
  const setPetTypeImage = useSetPetTypeImage();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasImage = Boolean(item.imageUrl?.trim());
  const rowPending = disabled || setPetTypeImage.isPending;
  const approveHintId = `approve-hint-${item.id}`;

  async function handleImageChange(url: string) {
    setUploadError(null);

    try {
      await setPetTypeImage.mutateAsync({
        petTypeId: item.id,
        imageUrl: url,
      });
    } catch (error) {
      setUploadError(isApiError(error) ? error.message : 'อัปโหลดรูปภาพไม่สำเร็จ');
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-surface/50 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="font-medium text-ink">{item.name}</p>
          <p className="text-xs text-muted">
            {item.slug} · {labelTaxonomyStatus(item.status)}
          </p>
        </div>
        <ImageUploadField
          label="รูปภาพประเภทสัตว์เลี้ยง"
          value={item.imageUrl ?? ''}
          onChange={(url) => void handleImageChange(url)}
          folder="pet-types"
          showUrl={false}
          disabled={rowPending}
          error={uploadError ?? undefined}
        />
        {!hasImage ? (
          <p id={approveHintId} className="text-xs text-muted">
            ต้องอัปโหลดรูปภาพก่อนอนุมัติ
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!hasImage || rowPending}
          aria-busy={rowPending}
          aria-describedby={!hasImage ? approveHintId : undefined}
          onClick={() => onApprove(item.id)}
        >
          อนุมัติ
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={rowPending}
          aria-busy={rowPending}
          onClick={() => onReject(item.id)}
        >
          ปฏิเสธ
        </Button>
        <TaxonomyDeleteButton item={item} kind="petType" disabled={rowPending} />
      </div>
    </li>
  );
}
