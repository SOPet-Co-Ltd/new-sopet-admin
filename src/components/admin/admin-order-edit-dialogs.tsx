'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
  useUpdateAdminOrderShippingAddress,
  useUpdateAdminOrderStatus,
} from '@/hooks/useAdminOrders';
import { getErrorMessage } from '@/lib/api/errors';
import { labelOrderStatus, orderStatusLabels } from '@/lib/i18n/th';
import {
  adminOrderShippingFormSchema,
  normalizeThaiPhoneInput,
  type AdminOrderShippingFormValues,
} from '@/lib/validations';
import type { Order } from '@/types';

const ORDER_STATUS_OPTIONS = Object.keys(orderStatusLabels);

type AdminOrderStatusEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentStatus: string;
};

function AdminOrderStatusEditForm({
  orderId,
  currentStatus,
  onClose,
  onSelectOpenChange,
}: {
  orderId: string;
  currentStatus: string;
  onClose: () => void;
  onSelectOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateAdminOrderStatus();
  const [status, setStatus] = useState(currentStatus);

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({ orderId, status });
      onClose();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>แก้ไขสถานะคำสั่งซื้อ</DialogTitle>
        <DialogDescription>
          เปลี่ยนสถานะออเดอร์สำหรับการซัพพอร์ต — การเปลี่ยนบางสถานะมีผลต่อสต็อกและการแจ้งเตือน
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label htmlFor="order-status">สถานะ</Label>
          <Select value={status} onValueChange={setStatus} onOpenChange={onSelectOpenChange}>
            <SelectTrigger id="order-status" className="mt-1.5" aria-label="สถานะ">
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent position="popper">
              {ORDER_STATUS_OPTIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {labelOrderStatus(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {updateMutation.isError ? (
          <p className="text-sm text-danger" role="alert">
            {getErrorMessage(updateMutation.error, 'เปลี่ยนสถานะไม่สำเร็จ')}
          </p>
        ) : null}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button
          type="button"
          disabled={updateMutation.isPending || status === currentStatus}
          aria-busy={updateMutation.isPending}
          onClick={() => void handleSave()}
        >
          {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AdminOrderStatusEditDialog({
  open,
  onOpenChange,
  orderId,
  currentStatus,
}: AdminOrderStatusEditDialogProps) {
  const [selectOpen, setSelectOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectOpen(false);
        onOpenChange(next);
      }}
    >
      <DialogContent
        onPointerDownOutside={(event) => {
          if (selectOpen) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (selectOpen) event.preventDefault();
        }}
        onFocusOutside={(event) => {
          if (selectOpen) event.preventDefault();
        }}
      >
        {open ? (
          <AdminOrderStatusEditForm
            key={`${orderId}-${currentStatus}`}
            orderId={orderId}
            currentStatus={currentStatus}
            onClose={() => onOpenChange(false)}
            onSelectOpenChange={setSelectOpen}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type AdminOrderShippingEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
};

function AdminOrderShippingEditForm({ order, onClose }: { order: Order; onClose: () => void }) {
  const updateMutation = useUpdateAdminOrderShippingAddress();
  const address = order.shippingAddress;

  const form = useForm<AdminOrderShippingFormValues>({
    resolver: zodResolver(adminOrderShippingFormSchema),
    defaultValues: {
      fullName: address?.fullName ?? '',
      phone: address?.phone ?? '',
      addressLine1: address?.addressLine1 ?? '',
      addressLine2: address?.addressLine2 ?? '',
      tumbon: address?.tumbon ?? '',
      amphoe: address?.amphoe ?? '',
      province: address?.province ?? '',
      postalCode: address?.postalCode ?? '',
    },
  });

  async function onSubmit(values: AdminOrderShippingFormValues) {
    try {
      await updateMutation.mutateAsync({
        orderId: order.id,
        fullName: values.fullName.trim(),
        phone: normalizeThaiPhoneInput(values.phone),
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2?.trim() || undefined,
        tumbon: values.tumbon?.trim() || undefined,
        amphoe: values.amphoe.trim(),
        province: values.province.trim(),
        postalCode: values.postalCode.trim(),
      });
      onClose();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>แก้ไขที่อยู่จัดส่ง</DialogTitle>
        <DialogDescription>
          แก้ไขที่อยู่บนคำสั่งซื้อนี้เท่านั้น ไม่เปลี่ยนที่อยู่ในบัญชีลูกค้า
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ship-fullName" required>
              ชื่อผู้รับ
            </Label>
            <Input id="ship-fullName" className="mt-1.5" {...form.register('fullName')} />
            {form.formState.errors.fullName ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="ship-phone" required>
              เบอร์โทร
            </Label>
            <Input id="ship-phone" className="mt-1.5" {...form.register('phone')} />
            {form.formState.errors.phone ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.phone.message}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <Label htmlFor="ship-line1" required>
            ที่อยู่บรรทัด 1
          </Label>
          <Input id="ship-line1" className="mt-1.5" {...form.register('addressLine1')} />
          {form.formState.errors.addressLine1 ? (
            <p className="mt-1 text-xs text-danger" role="alert">
              {form.formState.errors.addressLine1.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="ship-line2">ที่อยู่บรรทัด 2</Label>
          <Input id="ship-line2" className="mt-1.5" {...form.register('addressLine2')} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ship-tumbon">ตำบล/แขวง</Label>
            <Input id="ship-tumbon" className="mt-1.5" {...form.register('tumbon')} />
          </div>
          <div>
            <Label htmlFor="ship-amphoe" required>
              อำเภอ/เขต
            </Label>
            <Input id="ship-amphoe" className="mt-1.5" {...form.register('amphoe')} />
            {form.formState.errors.amphoe ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.amphoe.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ship-province" required>
              จังหวัด
            </Label>
            <Input id="ship-province" className="mt-1.5" {...form.register('province')} />
            {form.formState.errors.province ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.province.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="ship-postal" required>
              รหัสไปรษณีย์
            </Label>
            <Input id="ship-postal" className="mt-1.5" {...form.register('postalCode')} />
            {form.formState.errors.postalCode ? (
              <p className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.postalCode.message}
              </p>
            ) : null}
          </div>
        </div>
        {updateMutation.isError ? (
          <p className="text-sm text-danger" role="alert">
            {getErrorMessage(updateMutation.error, 'บันทึกที่อยู่ไม่สำเร็จ')}
          </p>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            aria-busy={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function AdminOrderShippingEditDialog({
  open,
  onOpenChange,
  order,
}: AdminOrderShippingEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {open ? (
          <AdminOrderShippingEditForm
            key={order.id}
            order={order}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
