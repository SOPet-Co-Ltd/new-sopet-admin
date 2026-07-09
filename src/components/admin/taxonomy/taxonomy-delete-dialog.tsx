'use client';

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import type { TaxonomyItem } from '@/types';

export type TaxonomyDeleteKind = 'category' | 'tag' | 'petType' | 'brand';

const KIND_LABELS: Record<TaxonomyDeleteKind, string> = {
  category: 'หมวดหมู่',
  tag: 'แท็ก',
  petType: 'ประเภทสัตว์เลี้ยง',
  brand: 'แบรนด์',
};

export interface TaxonomyDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TaxonomyItem | null;
  kind: TaxonomyDeleteKind;
  productCount?: number;
  isLoadingImpact?: boolean;
  isDeleting?: boolean;
  onConfirm: () => Promise<void>;
}

export function TaxonomyDeleteDialog({
  open,
  onOpenChange,
  item,
  kind,
  productCount = 0,
  isLoadingImpact = false,
  isDeleting = false,
  onConfirm,
}: TaxonomyDeleteDialogProps) {
  const label = KIND_LABELS[kind];

  const description = isLoadingImpact ? (
    <p>กำลังตรวจสอบสินค้าที่เชื่อมอยู่...</p>
  ) : productCount > 0 ? (
    <p>
      มีสินค้า {productCount} รายการที่เชื่อมกับ{label}นี้ —
      ระบบจะยกเลิกการเชื่อมและแจ้งเตือนร้านค้าที่ได้รับผลกระทบ
    </p>
  ) : (
    <p>ไม่มีสินค้าเชื่อมกับรายการนี้</p>
  );

  if (!item) {
    return null;
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`ลบ${label}`}
      confirmLabel={item.name}
      description={description}
      isDeleting={isDeleting || isLoadingImpact}
      onConfirm={onConfirm}
    />
  );
}
