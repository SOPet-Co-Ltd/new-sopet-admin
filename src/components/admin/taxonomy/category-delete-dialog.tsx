'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCategoryDeleteImpact, useDeleteCategory } from '@/hooks/useTaxonomy';
import { isApiError } from '@/lib/api/errors';
import type { TaxonomyItem } from '@/types';

type WizardStep = 1 | 2 | 3;

export interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: TaxonomyItem | null;
  approvedCategories: TaxonomyItem[];
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  approvedCategories,
  triggerRef,
}: CategoryDeleteDialogProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [replacementCategoryId, setReplacementCategoryId] = useState<string | null>(null);
  const [showReplacementAlert, setShowReplacementAlert] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const categoryId = category?.id ?? '';
  const {
    data: impact,
    isLoading: isLoadingImpact,
    isError: isImpactError,
    refetch,
  } = useCategoryDeleteImpact(categoryId, open && !!categoryId);
  const deleteCategory = useDeleteCategory();

  const productCount = impact?.productCount ?? 0;
  const products = impact?.products ?? [];
  const overflowCount = Math.max(0, productCount - products.length);
  const replacementOptions = approvedCategories.filter((item) => item.id !== categoryId);
  const selectedReplacement = replacementOptions.find((item) => item.id === replacementCategoryId);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setStep(1);
      setReplacementCategoryId(null);
      setShowReplacementAlert(false);
      setDeleteError(null);
    }
    onOpenChange(nextOpen);
  }

  useEffect(() => {
    if (!open && triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [open, triggerRef]);

  if (!category) {
    return null;
  }

  const stepTitle = step === 1 ? 'ลบหมวดหมู่' : step === 2 ? 'เลือกหมวดหมู่ทดแทน' : 'ยืนยันการลบ';

  function handleNextFromStep1() {
    setStep(productCount === 0 ? 3 : 2);
  }

  function handleNextFromStep2() {
    if (!replacementCategoryId) {
      setShowReplacementAlert(true);
      return;
    }
    setShowReplacementAlert(false);
    setStep(3);
  }

  async function handleConfirmDelete() {
    if (!category) {
      return;
    }

    setDeleteError(null);
    try {
      await deleteCategory.mutateAsync({
        id: category.id,
        ...(replacementCategoryId ? { replacementCategoryId } : {}),
      });
      handleOpenChange(false);
    } catch (error) {
      setDeleteError(isApiError(error) ? error.message : 'ลบหมวดหมู่ไม่สำเร็จ');
    }
  }

  const isDeleting = deleteCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-labelledby="category-delete-title">
        <DialogHeader>
          <DialogTitle id="category-delete-title">{stepTitle}</DialogTitle>
          <DialogDescription className="sr-only">ขั้นตอนที่ {step} จาก 3</DialogDescription>
          <p aria-live="polite" className="text-xs text-muted">
            ขั้นตอนที่ {step} จาก 3
          </p>
        </DialogHeader>

        {isLoadingImpact ? (
          <p className="text-sm text-muted">กำลังตรวจสอบผลกระทบ...</p>
        ) : isImpactError ? (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-danger">
              โหลดข้อมูลผลกระทบไม่สำเร็จ
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
              ลองอีกครั้ง
            </Button>
          </div>
        ) : step === 1 ? (
          <div className="space-y-3 text-sm text-muted">
            {productCount > 0 ? (
              <>
                <p>หมวดหมู่นี้มีสินค้า {productCount} รายการ</p>
                <ul className="list-inside list-disc space-y-1 text-ink">
                  {products.map((product) => (
                    <li key={product.id}>{product.name}</li>
                  ))}
                </ul>
                {overflowCount > 0 ? (
                  <p className="text-muted">และอีก {overflowCount} รายการ</p>
                ) : null}
              </>
            ) : (
              <p>ไม่มีสินค้าในหมวดหมู่นี้</p>
            )}
          </div>
        ) : step === 2 ? (
          <div className="space-y-3">
            {replacementOptions.length === 0 ? (
              <p className="text-sm text-muted">ไม่มีหมวดหมู่ทดแทนที่ใช้ได้</p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="replacement-category-select" required>
                  หมวดหมู่ทดแทน
                </Label>
                <select
                  id="replacement-category-select"
                  aria-label="หมวดหมู่ทดแทน"
                  aria-required="true"
                  className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  value={replacementCategoryId ?? ''}
                  onChange={(event) => {
                    setReplacementCategoryId(event.target.value);
                    setShowReplacementAlert(false);
                  }}
                >
                  <option value="">เลือกหมวดหมู่ทดแทน</option>
                  {replacementOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showReplacementAlert ? (
              <p role="alert" className="text-sm text-danger">
                เลือกหมวดหมู่ทดแทน
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2 text-sm text-muted">
            {productCount > 0 ? (
              <p>
                ยืนยันการลบและย้ายสินค้า {productCount} รายการจาก &quot;{category.name}&quot;
                {selectedReplacement ? ` ไปยัง "${selectedReplacement.name}"` : ''}
              </p>
            ) : (
              <p>ยืนยันการลบหมวดหมู่ &quot;{category.name}&quot;</p>
            )}
            {deleteError ? (
              <p role="alert" className="text-danger">
                {deleteError}
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting || isLoadingImpact}
            onClick={() => handleOpenChange(false)}
          >
            ยกเลิก
          </Button>
          {step === 1 ? (
            <Button
              type="button"
              disabled={isLoadingImpact || isImpactError}
              onClick={handleNextFromStep1}
            >
              ถัดไป
            </Button>
          ) : step === 2 ? (
            <Button
              type="button"
              disabled={!replacementCategoryId || replacementOptions.length === 0}
              onClick={handleNextFromStep2}
            >
              ถัดไป
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              aria-busy={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? 'กำลังลบ...' : 'ลบหมวดหมู่'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
