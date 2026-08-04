'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductDescriptionMarkdown } from '@/lib/markdown/product-description-markdown';

export type ProductDescriptionPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
};

function isDescriptionEmpty(description: string): boolean {
  return description.trim().length === 0;
}

export function ProductDescriptionPreviewDialog({
  open,
  onOpenChange,
  description,
}: ProductDescriptionPreviewDialogProps) {
  const empty = isDescriptionEmpty(description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>ตัวอย่างรายละเอียดสินค้า</DialogTitle>
          <DialogDescription>แสดงผลแบบเดียวกับหน้ารายละเอียดสินค้าบน SOPet</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {empty ? (
            <p className="py-8 text-center text-sm text-muted">ยังไม่มีรายละเอียดสินค้า</p>
          ) : (
            <ProductDescriptionMarkdown description={description} />
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
