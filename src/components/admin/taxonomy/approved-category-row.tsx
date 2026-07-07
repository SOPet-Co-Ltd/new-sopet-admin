'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { useSetCategoryImage, useUpdateCategory } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import type { TaxonomyItem } from '@/types';

export interface ApprovedCategoryRowProps {
  item: TaxonomyItem;
  disabled?: boolean;
}

export function ApprovedCategoryRow({ item, disabled = false }: ApprovedCategoryRowProps) {
  const updateCategory = useUpdateCategory();
  const setCategoryImage = useSetCategoryImage();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const rowPending = disabled || updateCategory.isPending || setCategoryImage.isPending;

  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    if (trimmed === item.name) {
      setEditing(false);
      setNameError(null);
      return;
    }

    setNameError(null);

    try {
      await updateCategory.mutateAsync({ categoryId: item.id, name: trimmed });
      setEditing(false);
    } catch (error) {
      setNameError(isApiError(error) ? error.message : 'บันทึกชื่อไม่สำเร็จ');
    }
  }

  async function handleImageChange(url: string) {
    setUploadError(null);

    try {
      await setCategoryImage.mutateAsync({
        categoryId: item.id,
        imageUrl: url,
      });
    } catch (error) {
      setUploadError(isApiError(error) ? error.message : 'อัปโหลดรูปภาพไม่สำเร็จ');
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-surface/50 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        {editing ? (
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={rowPending}
              aria-label="ชื่อหมวดหมู่"
            />
            {nameError ? (
              <p role="alert" className="text-xs text-danger">
                {nameError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={rowPending}
                aria-busy={rowPending}
                onClick={() => void handleSaveName()}
              >
                บันทึก
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={rowPending}
                onClick={() => {
                  setEditing(false);
                  setName(item.name);
                  setNameError(null);
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium text-ink">{item.name}</p>
            <p className="text-xs text-muted">
              {item.slug} · {labelTaxonomyStatus(item.status)}
            </p>
          </div>
        )}
        <ImageUploadField
          label="รูปภาพหมวดหมู่"
          value={item.imageUrl ?? ''}
          onChange={(url) => void handleImageChange(url)}
          folder="categories"
          showUrl={false}
          disabled={rowPending}
          error={uploadError ?? undefined}
        />
      </div>
      {!editing ? (
        <div className="flex shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={rowPending}
            onClick={() => setEditing(true)}
          >
            แก้ไขชื่อ
          </Button>
        </div>
      ) : null}
    </li>
  );
}
