'use client';

import { type RefObject } from 'react';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { usePlatformStorefrontUrl } from '@/hooks/usePlatformStorefrontUrl';
import { buildTrackingUrl } from '@/lib/api/platform-settings';

interface VendorOrderTrackingLinkDialogProps {
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuTriggerRef: RefObject<HTMLElement | null>;
}

export function VendorOrderTrackingLinkDialog({
  orderNumber,
  open,
  onOpenChange,
  menuTriggerRef,
}: VendorOrderTrackingLinkDialogProps) {
  const { data: storefrontUrl, isLoading, isError } = usePlatformStorefrontUrl();
  const { show } = useToast();

  const trackingUrl = storefrontUrl != null ? buildTrackingUrl(storefrontUrl, orderNumber) : null;

  async function handleCopy() {
    if (!trackingUrl) return;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      show('คัดลอกลิงก์แล้ว', 'success');
    } catch {
      show('ไม่สามารถคัดลอกได้', 'error');
    }
  }

  function handleCloseAutoFocus(event: Event) {
    event.preventDefault();
    menuTriggerRef.current?.focus();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onCloseAutoFocus={handleCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>ลิงก์ติดตามคำสั่งซื้อ</DialogTitle>
          <DialogDescription>ส่งลิงก์นี้ให้ลูกค้าเพื่อติดตามสถานะ {orderNumber}</DialogDescription>
        </DialogHeader>

        {isError ? (
          <p className="text-sm text-danger" role="alert">
            โหลดลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <code
            className="min-h-11 flex-1 overflow-x-auto rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm break-all text-ink"
            aria-busy={isLoading}
            aria-live="polite"
          >
            {isLoading || !trackingUrl ? 'กำลังโหลดลิงก์...' : trackingUrl}
          </code>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 self-stretch sm:self-auto"
            onClick={handleCopy}
            disabled={!trackingUrl}
            aria-label="คัดลอกลิงก์ติดตาม"
          >
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineClipboardDocument className="size-4" aria-hidden="true" />
              คัดลอก
            </span>
          </Button>
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
