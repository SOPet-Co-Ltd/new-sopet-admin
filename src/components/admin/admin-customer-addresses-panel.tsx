'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
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
  useAdminCustomerAddresses,
  useCreateCustomerAddressAsAdmin,
  useDeleteCustomerAddressAsAdmin,
  useSetCustomerDefaultAddressAsAdmin,
  useUpdateCustomerAddressAsAdmin,
} from '@/hooks/useAdminCustomers';
import { getErrorMessage } from '@/lib/api/errors';
import {
  adminCustomerAddressFormSchema,
  normalizeThaiPhoneInput,
  type AdminCustomerAddressFormValues,
} from '@/lib/validations';
import type { SavedAddress } from '@/types';

function formatAddressLines(address: SavedAddress): string {
  return [
    address.addressLine1,
    address.addressLine2,
    address.tumbon,
    address.amphoe,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
}

const EMPTY_FORM: AdminCustomerAddressFormValues = {
  label: '',
  recipientName: '',
  recipientPhone: '',
  addressLine1: '',
  addressLine2: '',
  tumbon: '',
  amphoe: '',
  province: '',
  postalCode: '',
  isDefault: false,
};

type AdminCustomerAddressesPanelProps = {
  customerId: string;
};

export function AdminCustomerAddressesPanel({ customerId }: AdminCustomerAddressesPanelProps) {
  const { data: addresses = [], isLoading, error } = useAdminCustomerAddresses(customerId);
  const createMutation = useCreateCustomerAddressAsAdmin(customerId);
  const updateMutation = useUpdateCustomerAddressAsAdmin(customerId);
  const deleteMutation = useDeleteCustomerAddressAsAdmin(customerId);
  const setDefaultMutation = useSetCustomerDefaultAddressAsAdmin(customerId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedAddress | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const form = useForm<AdminCustomerAddressFormValues>({
    resolver: zodResolver(adminCustomerAddressFormSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      form.reset({
        label: editing.label ?? '',
        recipientName: editing.fullName,
        recipientPhone: editing.phone,
        addressLine1: editing.addressLine1,
        addressLine2: editing.addressLine2 ?? '',
        tumbon: editing.tumbon ?? '',
        amphoe: editing.amphoe,
        province: editing.province,
        postalCode: editing.postalCode,
        isDefault: editing.isDefault,
      });
    } else {
      form.reset(EMPTY_FORM);
    }
  }, [dialogOpen, editing, form]);

  const mutationPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending;

  function openCreate() {
    setEditing(null);
    setActionMessage(null);
    setDialogOpen(true);
  }

  function openEdit(address: SavedAddress) {
    setEditing(address);
    setActionMessage(null);
    setDialogOpen(true);
  }

  async function onSubmit(values: AdminCustomerAddressFormValues) {
    setActionMessage(null);
    const payload = {
      label: values.label.trim(),
      recipientName: values.recipientName.trim(),
      recipientPhone: normalizeThaiPhoneInput(values.recipientPhone),
      addressLine1: values.addressLine1.trim(),
      addressLine2: values.addressLine2?.trim() || undefined,
      tumbon: values.tumbon?.trim() || undefined,
      amphoe: values.amphoe.trim(),
      province: values.province.trim(),
      postalCode: values.postalCode.trim(),
      isDefault: values.isDefault ?? false,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setDialogOpen(false);
      setEditing(null);
    } catch {
      // surfaced via mutation state
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionMessage(null);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setActionMessage(getErrorMessage(err, 'ลบที่อยู่ไม่สำเร็จ'));
      setDeleteTarget(null);
    }
  }

  async function handleSetDefault(address: SavedAddress) {
    setActionMessage(null);
    try {
      await setDefaultMutation.mutateAsync(address.id);
    } catch (err) {
      setActionMessage(getErrorMessage(err, 'ตั้งค่าที่อยู่หลักไม่สำเร็จ'));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-balance text-ink">
            ที่อยู่จัดส่งที่บันทึกไว้
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            เพิ่ม แก้ไข หรือลบที่อยู่สำหรับซัพพอร์ตลูกค้า
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          เพิ่มที่อยู่
        </Button>
      </CardHeader>
      <CardBody className="space-y-4">
        {isLoading ? <p className="text-sm text-muted-foreground">กำลังโหลดที่อยู่...</p> : null}
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {getErrorMessage(error, 'โหลดที่อยู่ไม่สำเร็จ')}
          </p>
        ) : null}
        {!isLoading && !error && addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีที่อยู่ที่บันทึกไว้</p>
        ) : null}
        <ul className="space-y-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="rounded-lg border border-border/70 bg-card px-4 py-3 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink">
                  {address.label?.trim() || 'ที่อยู่'} · {address.fullName}
                </p>
                {address.isDefault ? <Badge status="published">ค่าเริ่มต้น</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
              <p className="text-sm text-ink text-pretty">{formatAddressLines(address)}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={mutationPending}
                  onClick={() => openEdit(address)}
                >
                  แก้ไข
                </Button>
                {!address.isDefault ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={mutationPending}
                    aria-busy={setDefaultMutation.isPending}
                    onClick={() => void handleSetDefault(address)}
                  >
                    ตั้งเป็นค่าเริ่มต้น
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={mutationPending}
                  onClick={() => setDeleteTarget(address)}
                >
                  ลบ
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {actionMessage ? (
          <p className="text-sm text-danger" role="alert">
            {actionMessage}
          </p>
        ) : null}
      </CardBody>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่'}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วนตามที่ลูกค้าใช้งานในร้านค้า
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
            <div>
              <Label htmlFor="address-label" required>
                ป้ายชื่อ
              </Label>
              <Input id="address-label" className="mt-1.5" {...form.register('label')} />
              {form.formState.errors.label ? (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.label.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-recipient" required>
                  ชื่อผู้รับ
                </Label>
                <Input
                  id="address-recipient"
                  className="mt-1.5"
                  {...form.register('recipientName')}
                />
                {form.formState.errors.recipientName ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.recipientName.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="address-phone" required>
                  เบอร์โทร
                </Label>
                <Input id="address-phone" className="mt-1.5" {...form.register('recipientPhone')} />
                {form.formState.errors.recipientPhone ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.recipientPhone.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div>
              <Label htmlFor="address-line1" required>
                ที่อยู่บรรทัด 1
              </Label>
              <Input id="address-line1" className="mt-1.5" {...form.register('addressLine1')} />
              {form.formState.errors.addressLine1 ? (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.addressLine1.message}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="address-line2">ที่อยู่บรรทัด 2</Label>
              <Input id="address-line2" className="mt-1.5" {...form.register('addressLine2')} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-tumbon">ตำบล/แขวง</Label>
                <Input id="address-tumbon" className="mt-1.5" {...form.register('tumbon')} />
              </div>
              <div>
                <Label htmlFor="address-amphoe" required>
                  อำเภอ/เขต
                </Label>
                <Input id="address-amphoe" className="mt-1.5" {...form.register('amphoe')} />
                {form.formState.errors.amphoe ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.amphoe.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="address-province" required>
                  จังหวัด
                </Label>
                <Input id="address-province" className="mt-1.5" {...form.register('province')} />
                {form.formState.errors.province ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.province.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="address-postal" required>
                  รหัสไปรษณีย์
                </Label>
                <Input id="address-postal" className="mt-1.5" {...form.register('postalCode')} />
                {form.formState.errors.postalCode ? (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.postalCode.message}
                  </p>
                ) : null}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...form.register('isDefault')} />
              ตั้งเป็นที่อยู่หลัก
            </label>
            {createMutation.isError || updateMutation.isError ? (
              <p className="text-sm text-danger" role="alert">
                {getErrorMessage(
                  createMutation.error ?? updateMutation.error,
                  'บันทึกที่อยู่ไม่สำเร็จ',
                )}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={mutationPending}
                aria-busy={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลบที่อยู่</DialogTitle>
            <DialogDescription>
              ยืนยันการลบที่อยู่{deleteTarget?.label ? ` “${deleteTarget.label}”` : ''} หรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              aria-busy={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? 'กำลังลบ...' : 'ลบที่อยู่'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
