'use client';

import { useRef, useState } from 'react';
import { CategoryDeleteDialog } from '@/components/admin/taxonomy/category-delete-dialog';
import {
  TaxonomyDeleteDialog,
  type TaxonomyDeleteKind,
} from '@/components/admin/taxonomy/taxonomy-delete-dialog';
import { Button } from '@/components/ui/button';
import {
  useApprovedCategories,
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { data: approvedCategories = [] } = useApprovedCategories();

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
    if (kind === 'tag') {
      await deleteTag.mutateAsync(item.id);
      return;
    }
    if (kind === 'petType') {
      await deletePetType.mutateAsync({ id: item.id });
      return;
    }
    if (kind === 'brand') {
      await deleteBrand.mutateAsync({ id: item.id });
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        size={size}
        variant={variant}
        disabled={disabled || isDeleting}
        onClick={() => setOpen(true)}
      >
        ลบ
      </Button>
      {kind === 'category' ? (
        <CategoryDeleteDialog
          open={open}
          onOpenChange={setOpen}
          category={item}
          approvedCategories={approvedCategories}
          triggerRef={triggerRef}
        />
      ) : (
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
      )}
    </>
  );
}
