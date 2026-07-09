'use client';

import { useState } from 'react';
import {
  TaxonomyDeleteDialog,
  type TaxonomyDeleteKind,
} from '@/components/admin/taxonomy/taxonomy-delete-dialog';
import { Button } from '@/components/ui/button';
import {
  useBrandDeleteImpact,
  useCategoryDeleteImpact,
  useDeleteBrand,
  useDeleteCategory,
  useDeletePetType,
  useDeleteTag,
  usePetTypeDeleteImpact,
  useTagDeleteImpact,
} from '@/hooks/useTaxonomy';
import type { TaxonomyItem } from '@/types';

interface TaxonomyDeleteButtonProps {
  item: TaxonomyItem;
  kind: TaxonomyDeleteKind;
  disabled?: boolean;
  size?: 'sm' | 'default';
  variant?: 'outline' | 'destructive';
}

export function TaxonomyDeleteButton({
  item,
  kind,
  disabled = false,
  size = 'sm',
  variant = 'outline',
}: TaxonomyDeleteButtonProps) {
  const [open, setOpen] = useState(false);

  const categoryImpact = useCategoryDeleteImpact(item.id, open && kind === 'category');
  const tagImpact = useTagDeleteImpact(item.id, open && kind === 'tag');
  const petTypeImpact = usePetTypeDeleteImpact(item.id, open && kind === 'petType');
  const brandImpact = useBrandDeleteImpact(item.id, open && kind === 'brand');

  const deleteCategory = useDeleteCategory();
  const deleteTag = useDeleteTag();
  const deletePetType = useDeletePetType();
  const deleteBrand = useDeleteBrand();

  const impact =
    kind === 'category'
      ? categoryImpact
      : kind === 'tag'
        ? tagImpact
        : kind === 'petType'
          ? petTypeImpact
          : brandImpact;

  const isDeleting =
    deleteCategory.isPending ||
    deleteTag.isPending ||
    deletePetType.isPending ||
    deleteBrand.isPending;

  async function handleConfirm() {
    if (kind === 'category') {
      await deleteCategory.mutateAsync({ id: item.id });
      return;
    }
    if (kind === 'tag') {
      await deleteTag.mutateAsync(item.id);
      return;
    }
    if (kind === 'petType') {
      await deletePetType.mutateAsync({ id: item.id });
      return;
    }
    await deleteBrand.mutateAsync({ id: item.id });
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={disabled || isDeleting}
        onClick={() => setOpen(true)}
      >
        ลบ
      </Button>
      <TaxonomyDeleteDialog
        open={open}
        onOpenChange={setOpen}
        item={item}
        kind={kind}
        productCount={impact.data?.productCount ?? 0}
        isLoadingImpact={impact.isLoading}
        isDeleting={isDeleting}
        onConfirm={handleConfirm}
      />
    </>
  );
}
