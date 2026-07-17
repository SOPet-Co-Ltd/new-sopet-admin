'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useAcknowledgeVendorOrder,
  useCancelVendorOrder,
  useMarkVendorOrderPaid,
  useShipVendorOrder,
} from '@/hooks/useVendorOrderWorkflow';
import { useShippingProviders } from '@/hooks/useShipping';
import { labelOrderStatus } from '@/lib/i18n/th';
import {
  canVendorCancelOrder,
  getStoreShipmentInfo,
  getVendorOrderWorkflowAction,
  vendorCancelWillRefund,
} from '@/lib/orders/workflow';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

const WORKFLOW_STEPS = [
  { key: 'pending_payment', label: 'รอชำระเงิน' },
  { key: 'paid', label: 'ชำระแล้ว' },
  { key: 'processing', label: 'กำลังดำเนินการ' },
  { key: 'shipped', label: 'จัดส่งแล้ว' },
  { key: 'delivered', label: 'ส่งถึงแล้ว' },
] as const;

function getActiveStepIndex(order: Order): number {
  if (order.status === 'cancelled' || order.status === 'refunded') {
    return -1;
  }
  const index = WORKFLOW_STEPS.findIndex((step) => step.key === order.status);
  return index >= 0 ? index : 0;
}

interface VendorOrderWorkflowProps {
  order: Order;
  storeId?: string;
}

export function VendorOrderWorkflow({ order, storeId }: VendorOrderWorkflowProps) {
  const action = getVendorOrderWorkflowAction(order, storeId);
  const shipment = getStoreShipmentInfo(order, storeId);
  const { data: providers = [] } = useShippingProviders(false);

  const [fulfillmentProvider, setFulfillmentProvider] = useState(
    shipment?.fulfillmentProvider ?? '',
  );
  const [trackingNumber, setTrackingNumber] = useState(shipment?.trackingNumber ?? '');
  const [trackingUrl, setTrackingUrl] = useState(shipment?.trackingUrl ?? '');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const markPaidMutation = useMarkVendorOrderPaid();
  const acknowledgeMutation = useAcknowledgeVendorOrder();
  const shipMutation = useShipVendorOrder();
  const cancelMutation = useCancelVendorOrder();

  const canCancel = canVendorCancelOrder(order, storeId);
  const willRefund = vendorCancelWillRefund(order);

  const canSubmitShipment =
    fulfillmentProvider.trim().length > 0 && trackingNumber.trim().length > 0;

  const isPending =
    markPaidMutation.isPending ||
    acknowledgeMutation.isPending ||
    shipMutation.isPending ||
    cancelMutation.isPending;
  const activeStep = getActiveStepIndex(order);
  const hasPrimaryAction = action === 'mark_paid' || action === 'acknowledge' || action === 'ship';

  const handleCancelConfirm = () => {
    cancelMutation.mutate(order.id, {
      onSuccess: () => setCancelDialogOpen(false),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">ขั้นตอนถัดไป</h2>
            <p className="mt-0.5 text-sm text-muted">
              สถานะปัจจุบัน: {labelOrderStatus(order.status)}
              {activeStep >= 0 ? ' — ดำเนินการตามลำดับเท่านั้น' : null}
            </p>
          </div>
        </div>

        {activeStep >= 0 ? (
          <ol className="mt-4 flex flex-wrap gap-2" aria-label="ลำดับสถานะคำสั่งซื้อ">
            {WORKFLOW_STEPS.map((step, index) => {
              const isComplete = index < activeStep;
              const isCurrent = index === activeStep;
              return (
                <li
                  key={step.key}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                    isComplete && 'bg-success-bg text-success',
                    isCurrent && 'bg-brand-tint text-brand ring-1 ring-brand/30',
                    !isComplete && !isCurrent && 'bg-surface text-muted',
                  )}
                >
                  {step.label}
                </li>
              );
            })}
          </ol>
        ) : null}
      </CardHeader>

      <CardBody className="space-y-4">
        {hasPrimaryAction ? (
          <div className="rounded-xl bg-surface px-4 py-4 space-y-3">
            {action === 'mark_paid' ? (
              <>
                <p className="text-sm text-ink text-pretty">
                  ยืนยันว่าลูกค้าชำระเงินแล้ว (เช่น COD หรือโอนนอกระบบ) ก่อนเริ่มเตรียมสินค้า
                </p>
                <Button
                  type="button"
                  disabled={isPending}
                  aria-busy={markPaidMutation.isPending}
                  onClick={() => markPaidMutation.mutate(order.id)}
                >
                  {markPaidMutation.isPending ? 'กำลังยืนยัน...' : 'ยืนยันชำระเงินแล้ว'}
                </Button>
              </>
            ) : null}

            {action === 'acknowledge' ? (
              <>
                <p className="text-sm text-ink text-pretty">
                  แจ้งลูกค้าว่าร้านได้รับคำสั่งซื้อแล้ว สถานะจะเปลี่ยนเป็นกำลังดำเนินการ
                </p>
                <Button
                  type="button"
                  disabled={isPending}
                  aria-busy={acknowledgeMutation.isPending}
                  onClick={() => acknowledgeMutation.mutate(order.id)}
                >
                  {acknowledgeMutation.isPending
                    ? 'กำลังแจ้งลูกค้า...'
                    : 'แจ้งลูกค้าว่ารับคำสั่งซื้อแล้ว'}
                </Button>
              </>
            ) : null}

            {action === 'ship' ? (
              <div className="space-y-3">
                <p className="text-sm text-ink text-pretty">
                  กรอกข้อมูลการจัดส่งเพื่อแจ้งลูกค้าว่าสินค้าออกจากร้านแล้ว
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor={`ship-provider-${order.id}`} required>
                    ผู้ให้บริการขนส่ง
                  </Label>
                  <Select value={fulfillmentProvider} onValueChange={setFulfillmentProvider}>
                    <SelectTrigger id={`ship-provider-${order.id}`} aria-label="ผู้ให้บริการขนส่ง">
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

                <div className="space-y-1.5">
                  <Label htmlFor={`ship-tracking-${order.id}`} required>
                    เลขพัสดุ
                  </Label>
                  <Input
                    id={`ship-tracking-${order.id}`}
                    type="text"
                    placeholder="เช่น TH123456789"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`ship-url-${order.id}`}>ลิงก์ติดตาม (ไม่บังคับ)</Label>
                  <Input
                    id={`ship-url-${order.id}`}
                    type="url"
                    inputMode="url"
                    placeholder="https://track.example.com/..."
                    value={trackingUrl}
                    onChange={(event) => setTrackingUrl(event.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  disabled={isPending || !canSubmitShipment}
                  aria-busy={shipMutation.isPending}
                  onClick={() =>
                    shipMutation.mutate({
                      orderId: order.id,
                      trackingNumber: trackingNumber.trim(),
                      fulfillmentProvider: fulfillmentProvider.trim(),
                      trackingUrl: trackingUrl.trim() || null,
                    })
                  }
                >
                  {shipMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกและจัดส่ง'}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {action === 'awaiting_customer' ? (
          <div className="space-y-2 rounded-xl bg-surface px-4 py-4 text-sm">
            <p className="font-medium text-ink">จัดส่งแล้ว — รอลูกค้ายืนยันการรับสินค้า</p>
            {shipment?.fulfillmentProvider ? (
              <p className="text-muted">
                ขนส่ง: <span className="font-medium text-ink">{shipment.fulfillmentProvider}</span>
              </p>
            ) : null}
            {shipment?.trackingNumber ? (
              <p className="text-muted">
                เลขพัสดุ:{' '}
                <span className="font-medium tabular-nums text-ink">{shipment.trackingNumber}</span>
              </p>
            ) : null}
            {shipment?.trackingUrl ? (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-brand transition-colors hover:underline"
              >
                เปิดลิงก์ติดตามพัสดุ
              </a>
            ) : null}
          </div>
        ) : null}

        {action === 'completed' ? (
          <p className="rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success">
            คำสั่งซื้อสำหรับร้านของคุณเสร็จสมบูรณ์แล้ว
          </p>
        ) : null}

        {action === 'none' && order.status !== 'delivered' ? (
          <p className="text-sm text-muted">ไม่มีการดำเนินการที่พร้อมใช้งานในขณะนี้</p>
        ) : null}

        {canCancel ? (
          <div
            className={cn(
              hasPrimaryAction || action === 'awaiting_customer'
                ? 'border-t border-border pt-4'
                : '',
            )}
          >
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => setCancelDialogOpen(true)}
            >
              ยกเลิกคำสั่งซื้อ
            </Button>
          </div>
        ) : null}

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>ยกเลิกคำสั่งซื้อ</DialogTitle>
              <DialogDescription>
                {willRefund
                  ? 'ลูกค้าชำระเงินแล้ว ระบบจะคืนเงินให้ลูกค้าและยกเลิกคำสั่งซื้อนี้'
                  : 'คำสั่งซื้อจะถูกยกเลิกและคืนสต็อกสินค้า'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={cancelMutation.isPending}
                onClick={() => setCancelDialogOpen(false)}
              >
                ไม่ยกเลิก
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={cancelMutation.isPending}
                aria-busy={cancelMutation.isPending}
                onClick={handleCancelConfirm}
              >
                {cancelMutation.isPending
                  ? 'กำลังยกเลิก...'
                  : willRefund
                    ? 'ยกเลิกและคืนเงิน'
                    : 'ยืนยันยกเลิก'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardBody>
    </Card>
  );
}
