'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCancelPayoutRequest } from '@/hooks/usePayouts';
import { getErrorMessage } from '@/lib/api/errors';
import { formatCurrency } from '@/lib/utils';

type VendorCancelPayoutButtonProps = {
  amount: number;
};

export function VendorCancelPayoutButton({ amount }: VendorCancelPayoutButtonProps) {
  const cancelPayout = useCancelPayoutRequest();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-warning-text/30 bg-card text-warning-text hover:bg-warning-bg"
        onClick={() => setOpen(true)}
        disabled={cancelPayout.isPending}
      >
        ยกเลิกคำขอ
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (cancelPayout.isPending) return;
          setOpen(next);
        }}
      >
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>ยกเลิกคำขอรับเงิน</DialogTitle>
            <DialogDescription>
              ยกเลิกคำขอ {formatCurrency(amount)} ยอดนี้จะกลับมาให้ขอรับเงินใหม่ได้
              แอดมินจะไม่โอนรายการนี้
            </DialogDescription>
          </DialogHeader>
          {cancelPayout.isError ? (
            <p className="text-sm text-danger" role="alert">
              {getErrorMessage(cancelPayout.error, 'ยกเลิกคำขอไม่สำเร็จ')}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={cancelPayout.isPending}
              onClick={() => setOpen(false)}
            >
              ไม่ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelPayout.isPending}
              aria-busy={cancelPayout.isPending}
              onClick={() => {
                cancelPayout.mutate(undefined, {
                  onSuccess: () => setOpen(false),
                });
              }}
            >
              {cancelPayout.isPending ? 'กำลังยกเลิก...' : 'ยกเลิกคำขอ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
