'use client';

import { useState } from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSyncProductVariants } from '@/hooks/useSyncProductVariants';
import { useVariantSyncImpact } from '@/hooks/useVariantSyncImpact';
import { isApiError } from '@/lib/api/errors';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';
import type { VariantItem } from '@/lib/variants';
import type { VariantRemovalBlockReason } from '@/types';

const OVERFLOW_DISPLAY_LIMIT = 10;

export interface VariantSyncImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  variants: VariantItem[];
  productBasePrice: number;
  onSyncSuccess?: () => void;
}

function formatBlockReasons(reasons: VariantRemovalBlockReason[]): string {
  const hasOrders = reasons.includes('HAS_ORDERS');
  const hasCarts = reasons.includes('HAS_OPEN_CARTS');
  if (hasOrders && hasCarts) {
    return 'มีประวัติคำสั่งซื้อและอยู่ในตะกร้าสินค้า';
  }
  if (hasOrders) {
    return 'มีประวัติคำสั่งซื้อ';
  }
  if (hasCarts) {
    return 'อยู่ในตะกร้าสินค้า';
  }
  return 'ไม่สามารถลบได้';
}

export function VariantSyncImpactDialog({
  open,
  onOpenChange,
  productId,
  variants,
  productBasePrice,
  onSyncSuccess,
}: VariantSyncImpactDialogProps) {
  const [mutationError, setMutationError] = useState<string | null>(null);
  const syncMutation = useSyncProductVariants();
  const {
    data: impact,
    isLoading: isLoadingImpact,
    isError: isImpactError,
    isFetching,
    refetch,
  } = useVariantSyncImpact(productId, variants, productBasePrice, open && !!productId);

  const isSyncPending = syncMutation.isPending;
  const isBlocked = impact?.blocked === true;
  const canConfirm =
    !!impact && !impact.blocked && !isLoadingImpact && !isImpactError && !isSyncPending;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setMutationError(null);
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirmSync() {
    if (!impact || impact.blocked) {
      return;
    }
    setMutationError(null);
    try {
      await syncMutation.mutateAsync({
        productId,
        variants,
        productBasePrice,
      });
      handleOpenChange(false);
      onSyncSuccess?.();
    } catch (error) {
      if (isApiError(error) && error.code === 'VARIANT_REMOVAL_BLOCKED') {
        setMutationError(ERROR_MESSAGES.VARIANT_REMOVAL_BLOCKED);
      } else {
        setMutationError(
          isApiError(error)
            ? error.message
            : error instanceof Error
              ? error.message
              : 'บันทึก SKU/สต็อก/ราคาไม่สำเร็จ',
        );
      }
    }
  }

  const title = isBlocked
    ? 'ไม่สามารถบันทึกได้ — มี SKU ที่ถูกใช้งาน'
    : 'ยืนยันการบันทึกตัวเลือกสินค้า';

  const removedList = impact?.removedVariants ?? [];
  const visibleRemoved = removedList.slice(0, OVERFLOW_DISPLAY_LIMIT);
  const overflowCount = Math.max(0, removedList.length - OVERFLOW_DISPLAY_LIMIT);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-labelledby="variant-sync-impact-title" className="max-w-xl">
        <DialogHeader>
          <DialogTitle id="variant-sync-impact-title">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            ตรวจสอบผลกระทบก่อนบันทึกตัวเลือกสินค้า
          </DialogDescription>
        </DialogHeader>

        {isLoadingImpact || (isFetching && !impact && !isImpactError) ? (
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
        ) : impact && isBlocked ? (
          <div className="space-y-3">
            <div
              className="flex gap-2 rounded-lg bg-[var(--danger-bg)] p-3 text-sm text-danger"
              aria-live="assertive"
            >
              <HiExclamationTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>ไม่สามารถลบ SKU ต่อไปนี้ เพราะมีประวัติคำสั่งซื้อ และ/หรือ อยู่ในตะกร้าสินค้า</p>
            </div>
            <ul aria-label="SKU ที่ถูกบล็อก" className="max-h-[40vh] space-y-2 overflow-y-auto">
              {visibleRemoved.map((variant) => (
                <li key={variant.id} className="text-sm text-ink">
                  <span className="font-medium">{variant.sku}</span>
                  <span className="text-muted"> — {formatBlockReasons(variant.reasons)}</span>
                </li>
              ))}
            </ul>
            {overflowCount > 0 ? (
              <p className="text-sm text-muted">และอีก {overflowCount} รายการ</p>
            ) : null}
          </div>
        ) : impact ? (
          <div className="space-y-3">
            <p aria-live="polite" className="text-sm text-muted">
              คงไว้ {impact.kept} · สร้างใหม่ {impact.new} · ลบ {impact.removed}
            </p>
            {impact.removed === 0 ? (
              <p className="text-sm text-muted">ไม่มีการลบ SKU</p>
            ) : (
              <>
                <p className="text-sm text-ink">SKU ที่จะถูกลบ (soft-delete เมื่อไม่มีอ้างอิง)</p>
                <ul className="max-h-[40vh] list-inside list-disc space-y-1 overflow-y-auto text-sm text-ink">
                  {visibleRemoved.map((variant) => (
                    <li key={variant.id}>{variant.sku}</li>
                  ))}
                </ul>
                {overflowCount > 0 ? (
                  <p className="text-sm text-muted">และอีก {overflowCount} รายการ</p>
                ) : null}
              </>
            )}
            {mutationError ? (
              <p role="alert" className="text-sm text-danger">
                {mutationError}
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          {impact && !isBlocked && !isImpactError && !isLoadingImpact ? (
            <Button
              type="button"
              disabled={!canConfirm}
              aria-busy={isSyncPending}
              onClick={() => void handleConfirmSync()}
            >
              {isSyncPending ? 'กำลังบันทึก...' : 'ยืนยันการบันทึก'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
