'use client';

import {
  taxonomyListItemMetaClassName,
  taxonomyPendingRowClassName,
} from '@/components/admin/taxonomy/taxonomy-hub-primitives';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { TaxonomyDeleteButton } from '@/components/admin/taxonomy/taxonomy-delete-button';
import { useApproveCategory, useSetCategoryImage } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import { useState } from 'react';
import { labelTaxonomyStatus } from '@/lib/i18n/th';

import type { TaxonomyItem } from '@/types';

export interface PendingCategoryRowProps {
  item: TaxonomyItem;
  disabled?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingCategoryRow({
  item,
  disabled = false,
  onApprove,
  onReject,
}: PendingCategoryRowProps) {
  const setCategoryImage = useSetCategoryImage();
  const approveCategory = useApproveCategory();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  const hasImage = Boolean(item.imageUrl?.trim());
  const rowPending = disabled || setCategoryImage.isPending || approveCategory.isPending;
  const approveHintId = `approve-hint-${item.id}`;

  async function handleImageChange(url: string) {
    setUploadError(null);
    setApproveError(null);

    try {
      await setCategoryImage.mutateAsync({
        categoryId: item.id,
        imageUrl: url,
      });
    } catch (error) {
      setUploadError(isApiError(error) ? error.message : 'อัปโหลดรูปภาพไม่สำเร็จ');
    }
  }

  async function handleApprove() {
    setApproveError(null);

    if (!hasImage) {
      try {
        await approveCategory.mutateAsync(item.id);
      } catch (error) {
        setApproveError(isApiError(error) ? error.message : 'อนุมัติไม่สำเร็จ');
      }
      return;
    }

    onApprove(item.id);
  }

  return (
    <li className={taxonomyPendingRowClassName}>
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="truncate font-medium text-ink">{item.name}</p>
          <p className={taxonomyListItemMetaClassName}>
            {item.slug} · {labelTaxonomyStatus(item.status)}
          </p>
        </div>
        <ImageUploadField
          label="รูปภาพหมวดหมู่"
          value={item.imageUrl ?? ''}
          onChange={(url) => void handleImageChange(url)}
          folder="categories"
          showUrl={false}
          disabled={rowPending}
          error={uploadError ?? undefined}
        />
        {!hasImage ? (
          <p id={approveHintId} className="text-xs text-muted-foreground">
            ต้องอัปโหลดรูปภาพก่อนอนุมัติ
          </p>
        ) : null}
        {approveError ? (
          <p role="alert" className="text-xs text-danger">
            {approveError}
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
          onClick={() => void handleApprove()}
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
        <TaxonomyDeleteButton item={item} kind="category" disabled={rowPending} />
      </div>
    </li>
  );
}
