'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAcknowledgeVendorOrder,
  useMarkVendorOrderPaid,
  useShipVendorOrder,
} from '@/hooks/useVendorOrderWorkflow';
import { useShippingProviders } from '@/hooks/useShipping';
import {
  getStoreShipmentInfo,
  getVendorOrderWorkflowAction,
  type VendorOrderWorkflowAction,
} from '@/lib/orders/workflow';
import type { Order } from '@/types';

const ACTIONABLE = new Set<VendorOrderWorkflowAction>(['mark_paid', 'acknowledge', 'ship']);

type VendorOrderWorkflowActionDialogProps = {
  order: Order | null;
  storeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function dialogCopy(action: VendorOrderWorkflowAction, orderNumber: string) {
  switch (action) {
    case 'mark_paid':
      return {
        title: 'ยืนยันชำระเงิน',
        description: `ยืนยันว่าลูกค้าชำระเงินสำหรับ ${orderNumber} แล้ว (เช่น COD หรือโอนนอกระบบ) ก่อนเริ่มเตรียมสินค้า`,
        confirmLabel: 'ยืนยันแล้ว',
        pendingLabel: 'กำลังยืนยัน...',
      };
    case 'acknowledge':
      return {
        title: 'รับออเดอร์',
        description: `แจ้งลูกค้าว่าร้านได้รับคำสั่งซื้อ ${orderNumber} แล้ว สถานะจะเปลี่ยนเป็นกำลังดำเนินการ`,
        confirmLabel: 'ยืนยันรับออเดอร์',
        pendingLabel: 'กำลังแจ้งลูกค้า...',
      };
    case 'ship':
      return {
        title: 'จัดส่งสินค้า',
        description: `กรอกข้อมูลการจัดส่งสำหรับ ${orderNumber} เพื่อแจ้งลูกค้าว่าสินค้าออกจากร้านแล้ว`,
        confirmLabel: 'บันทึกและจัดส่ง',
        pendingLabel: 'กำลังบันทึก...',
      };
    default:
      return {
        title: 'ขั้นตอนถัดไป',
        description: `ไม่มีการดำเนินการสำหรับ ${orderNumber} ในขณะนี้`,
        confirmLabel: 'ปิด',
        pendingLabel: 'ปิด',
      };
  }
}

function VendorOrderWorkflowActionDialogContent({
  order,
  storeId,
  onSuccess,
  onCancel,
}: {
  order: Order;
  storeId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const action = getVendorOrderWorkflowAction(order, storeId);
  const shipment = getStoreShipmentInfo(order, storeId);
  const { data: providers = [] } = useShippingProviders(false);
  const copy = dialogCopy(action, order.orderNumber);

  const [fulfillmentProvider, setFulfillmentProvider] = useState(
    shipment?.fulfillmentProvider ?? '',
  );
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber ?? '');
  const [trackingUrl, setTrackingUrl] = useState(shipment?.trackingUrl ?? '');

  const markPaidMutation = useMarkVendorOrderPaid();
  const acknowledgeMutation = useAcknowledgeVendorOrder();
  const shipMutation = useShipVendorOrder();

  const canSubmitShipment =
    fulfillmentProvider.trim().length > 0 && trackingNumber.trim().length > 0;
  const isPending =
    markPaidMutation.isPending || acknowledgeMutation.isPending || shipMutation.isPending;

  const handleConfirm = () => {
    if (action === 'mark_paid') {
      markPaidMutation.mutate(order.id, { onSuccess });
      return;
    }
    if (action === 'acknowledge') {
      acknowledgeMutation.mutate(order.id, { onSuccess });
      return;
    }
    if (action === 'ship') {
      shipMutation.mutate(
        {
          orderId: order.id,
          trackingNumber: trackingNumber.trim(),
          fulfillmentProvider: fulfillmentProvider.trim(),
          trackingUrl: trackingUrl.trim() || null,
        },
        { onSuccess },
      );
    }
  };

  if (!ACTIONABLE.has(action)) {
    return (
      <DialogContent className="max-w-lg p-6 sm:p-8">
        <DialogHeader className="mb-6 space-y-2">
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription className="text-pretty leading-relaxed">
            {copy.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
            ปิด
          </Button>
          <Button type="button" className="w-full sm:w-auto" asChild>
            <Link href={`/vendor/orders/${order.id}`}>ดูรายละเอียด</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-lg p-6 sm:p-8">
      <DialogHeader className="mb-6 space-y-2">
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription className="text-pretty leading-relaxed">
          {copy.description}
        </DialogDescription>
        <p className="pt-1">
          <Link
            href={`/vendor/orders/${order.id}`}
            className="text-sm font-medium text-secondary underline-offset-2 hover:underline"
          >
            ดูรายละเอียดคำสั่งซื้อ
          </Link>
        </p>
      </DialogHeader>

      {action === 'ship' ? (
        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`list-ship-provider-${order.id}`} required>
              ผู้ให้บริการขนส่ง
            </Label>
            <Select value={fulfillmentProvider} onValueChange={setFulfillmentProvider}>
              <SelectTrigger id={`list-ship-provider-${order.id}`} aria-label="ผู้ให้บริการขนส่ง">
                <SelectValue placeholder="เลือกผู้ให้บริการขนส่ง" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.name}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {providers.length === 0 ? (
              <p className="text-xs text-muted">
                ยังไม่มีผู้ให้บริการขนส่งในระบบ กรุณาให้แอดมินเพิ่มที่เมนูจัดการขนส่ง
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`list-ship-tracking-${order.id}`} required>
              เลขพัสดุ
            </Label>
            <Input
              id={`list-ship-tracking-${order.id}`}
              type="text"
              placeholder="เช่น TH123456789"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`list-ship-url-${order.id}`}>ลิงก์ติดตาม (ไม่บังคับ)</Label>
            <Input
              id={`list-ship-url-${order.id}`}
              type="url"
              inputMode="url"
              placeholder="https://track.example.com/..."
              value={trackingUrl}
              onChange={(event) => setTrackingUrl(event.target.value)}
            />
          </div>
        </div>
      ) : null}

      <DialogFooter className="mt-0 flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={onCancel}
        >
          ยกเลิก
        </Button>
        <Button
          type="button"
          className="w-full sm:min-w-44 sm:w-auto"
          disabled={isPending || (action === 'ship' && !canSubmitShipment)}
          aria-busy={isPending}
          onClick={handleConfirm}
        >
          {isPending ? copy.pendingLabel : copy.confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function VendorOrderWorkflowActionDialog({
  order,
  storeId,
  open,
  onOpenChange,
}: VendorOrderWorkflowActionDialogProps) {
  return (
    <Dialog open={open && order != null} onOpenChange={onOpenChange}>
      {order ? (
        <VendorOrderWorkflowActionDialogContent
          key={order.id}
          order={order}
          storeId={storeId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}
