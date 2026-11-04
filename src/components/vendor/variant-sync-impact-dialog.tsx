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
import { isApiError, getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import type { VariantItem } from '@/lib/variants';
import type { ProductVariantSyncImpactRemoved, VariantRemovalDisposition } from '@/types';

const OVERFLOW_DISPLAY_LIMIT = 10;

export interface VariantSyncImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  variants: VariantItem[];
  onSyncSuccess?: () => void;
}

function formatDisposition(disposition: VariantRemovalDisposition, openCartCount: number): string {
  switch (disposition) {
    case 'RETIRE':
      return openCartCount > 0
        ? 'เก็บไว้สำหรับคำสั่งซื้อเดิม · ลบออกจากตะกร้า · ไม่ขายต่อ'
        : 'เก็บไว้สำหรับคำสั่งซื้อเดิม · ไม่ขายต่อในร้าน';
    case 'CLEAR_CART_AND_DELETE':
      return `ลบออกจากตะกร้า (${openCartCount}) แล้วลบ SKU`;
    case 'DELETE':
    default:
      return 'ลบ SKU';
  }
}

function ImpactStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'success' | 'danger';
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-center">
      <p
        className={cn(
          'text-lg font-semibold tabular-nums text-ink',
          tone === 'success' && value > 0 && 'text-success',
          tone === 'danger' && value > 0 && 'text-danger',
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ImpactLoadingSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted-foreground">กำลังตรวจสอบผลกระทบ...</p>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-surface motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="h-10 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
    </div>
  );
}

function RemovedSkuList({
  variants,
  ariaLabel,
}: {
  variants: ProductVariantSyncImpactRemoved[];
  ariaLabel: string;
}) {
  const visible = variants.slice(0, OVERFLOW_DISPLAY_LIMIT);
  const overflowCount = Math.max(0, variants.length - OVERFLOW_DISPLAY_LIMIT);

  return (
    <div className="space-y-2">
      <ul
        aria-label={ariaLabel}
        className="max-h-[40vh] divide-y divide-border overflow-y-auto rounded-lg border border-border"
      >
        {visible.map((variant) => (
          <li
            key={variant.id}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-3 py-2.5"
          >
            <span className="font-medium text-ink">{variant.sku}</span>
            <span className="text-sm text-muted-foreground">
              {formatDisposition(variant.disposition, variant.openCartCount)}
            </span>
          </li>
        ))}
      </ul>
      {overflowCount > 0 ? (
        <p className="text-sm text-muted-foreground">และอีก {overflowCount} รายการ</p>
      ) : null}
    </div>
  );
}

export function VariantSyncImpactDialog({
  open,
  onOpenChange,
  productId,
  variants,
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
  } = useVariantSyncImpact(productId, variants, open && !!productId);

  const isSyncPending = syncMutation.isPending;
  const canConfirm = !!impact && !isLoadingImpact && !isImpactError && !isSyncPending;
  const removedList = impact?.removedVariants ?? [];
  const hasRetire = removedList.some((entry) => entry.disposition === 'RETIRE');
  const hasCartClear = removedList.some(
    (entry) =>
      entry.disposition === 'CLEAR_CART_AND_DELETE' ||
      (entry.disposition === 'RETIRE' && entry.openCartCount > 0),
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setMutationError(null);
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirmSync() {
    if (!impact) {
      return;
    }
    setMutationError(null);
    try {
      await syncMutation.mutateAsync({
        productId,
        variants,
      });
      handleOpenChange(false);
      onSyncSuccess?.();
    } catch (error) {
      if (isApiError(error) && error.code === 'VARIANT_REMOVAL_BLOCKED') {
        setMutationError('บันทึกไม่สำเร็จ — ลองอีกครั้งหรือปรับตัวเลือกแล้วบันทึกใหม่');
      } else {
        setMutationError(getErrorMessage(error, 'บันทึก SKU/สต็อก/ราคาไม่สำเร็จ'));
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-labelledby="variant-sync-impact-title" className="max-w-xl">
        <DialogHeader>
          <DialogTitle id="variant-sync-impact-title" className="text-balance">
            ยืนยันการบันทึกตัวเลือกสินค้า
          </DialogTitle>
          <DialogDescription className="sr-only">
            ตรวจสอบผลกระทบก่อนบันทึกตัวเลือกสินค้า
          </DialogDescription>
        </DialogHeader>

        {isLoadingImpact || (isFetching && !impact && !isImpactError) ? (
          <ImpactLoadingSkeleton />
        ) : isImpactError ? (
          <div className="space-y-3">
            <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger">
              โหลดข้อมูลผลกระทบไม่สำเร็จ — ลองอีกครั้งก่อนบันทึก
            </p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
              ลองอีกครั้ง
            </Button>
          </div>
        ) : impact ? (
          <div className="space-y-4">
            <div
              aria-live="polite"
              className="grid grid-cols-3 gap-2"
              aria-label={`คงไว้ ${impact.kept} สร้างใหม่ ${impact.new} ลบ ${impact.removed}`}
            >
              <ImpactStat label="คงไว้" value={impact.kept} />
              <ImpactStat label="สร้างใหม่" value={impact.new} tone="success" />
              <ImpactStat label="นำออก" value={impact.removed} tone="danger" />
            </div>
            <p className="sr-only">
              คงไว้ {impact.kept} · สร้างใหม่ {impact.new} · ลบ {impact.removed}
            </p>

            {impact.removed === 0 ? (
              <p className="rounded-lg border border-border bg-surface/60 px-3 py-2.5 text-sm text-muted-foreground">
                ไม่มีการลบ SKU — บันทึกจะอัปเดตสต็อกและราคาของรายการที่มีอยู่
              </p>
            ) : (
              <div className="space-y-3">
                {(hasRetire || hasCartClear) && (
                  <div
                    className="flex gap-2.5 rounded-lg bg-warning-bg/80 p-3 text-sm text-ink"
                    aria-live="polite"
                  >
                    <HiExclamationTriangle
                      className="mt-0.5 size-5 shrink-0 text-warning-text"
                      aria-hidden="true"
                    />
                    <p className="text-pretty">
                      {hasRetire
                        ? 'SKU ที่มีประวัติคำสั่งซื้อจะถูกเก็บไว้ในระบบเพื่อออเดอร์เดิม แต่ลูกค้าใหม่จะซื้อไม่ได้'
                        : 'SKU ในตะกร้าจะถูกลบออกจากตะกร้าลูกค้าก่อนลบจากรายการสินค้า'}
                    </p>
                  </div>
                )}
                <p className="text-sm font-medium text-ink">SKU ที่จะนำออก ({impact.removed})</p>
                <RemovedSkuList variants={removedList} ariaLabel="SKU ที่จะนำออก" />
              </div>
            )}

            {mutationError ? (
              <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger">
                {mutationError}
              </p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            ยกเลิก
          </Button>
          {impact && !isImpactError && !isLoadingImpact ? (
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
