'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineTruck,
} from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminStores } from '@/hooks/useAdminStores';
import {
  useAdminCreateStoreShippingOption,
  useAdminDeleteStoreShippingOption,
  useAdminStoreShippingOptions,
  useAdminUpdateStoreShippingOption,
  useShippingProviders,
} from '@/hooks/useShipping';
import { shippingOptionSchema, type ShippingOptionFormValues } from '@/lib/validations';
import { cn, formatCurrency } from '@/lib/utils';
import type { StoreShippingOption } from '@/types';
import { activeStatusBadgeClass, providerLabel } from './shipping-helpers';

function StoreOptionsSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-busy="true" aria-live="polite">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-4 md:px-6" aria-hidden>
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-3 w-56 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
        </li>
      ))}
      <li className="sr-only">กำลังโหลดตัวเลือกการจัดส่ง...</li>
    </ul>
  );
}

export function StoreShippingOptionsPanel() {
  const { data: stores = [], isLoading: loadingStores } = useAdminStores();
  const { data: providers = [] } = useShippingProviders(true);
  const activeProviders = providers.filter((p) => p.isActive);

  const [selectedStoreId, setSelectedStoreId] = useState('');
  const {
    data: storeOptions = [],
    isLoading: loadingOptions,
    error: optionsError,
  } = useAdminStoreShippingOptions(selectedStoreId);

  const createStoreOption = useAdminCreateStoreShippingOption();
  const updateStoreOption = useAdminUpdateStoreShippingOption();
  const deleteStoreOption = useAdminDeleteStoreShippingOption();

  const [editingOption, setEditingOption] = useState<StoreShippingOption | null>(null);
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  const form = useForm<ShippingOptionFormValues>({
    resolver: zodResolver(shippingOptionSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      providerId: '',
      isActive: true,
    },
  });

  const mutationPending =
    createStoreOption.isPending || updateStoreOption.isPending || deleteStoreOption.isPending;
  const mutationError =
    createStoreOption.error ?? updateStoreOption.error ?? deleteStoreOption.error;

  const activeCount = storeOptions.filter((o) => o.isActive).length;
  const inactiveCount = storeOptions.length - activeCount;

  useEffect(() => {
    if (!editingOption) {
      form.reset({
        name: '',
        description: '',
        price: 0,
        providerId: '',
        isActive: true,
      });
      return;
    }
    form.reset({
      name: editingOption.name,
      description: editingOption.description ?? '',
      price: editingOption.price,
      providerId: editingOption.providerId ?? '',
      isActive: editingOption.isActive,
    });
  }, [editingOption, form]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function openCreate() {
    setSuccessMessage(null);
    setEditingOption(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      providerId: '',
      isActive: true,
    });
    setShowOptionForm(true);
  }

  function openEdit(option: StoreShippingOption) {
    setSuccessMessage(null);
    setEditingOption(option);
    setShowOptionForm(true);
  }

  function closeForm() {
    setShowOptionForm(false);
    setEditingOption(null);
    form.reset();
  }

  async function onSubmit(values: ShippingOptionFormValues) {
    if (!selectedStoreId) return;
    const input = {
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      providerId: values.providerId || undefined,
      isActive: values.isActive ?? true,
    };
    try {
      if (editingOption) {
        await updateStoreOption.mutateAsync({
          id: editingOption.id,
          storeId: selectedStoreId,
          input,
        });
        setSuccessMessage('อัปเดตตัวเลือกจัดส่งแล้ว');
      } else {
        await createStoreOption.mutateAsync({ storeId: selectedStoreId, input });
        setSuccessMessage('เพิ่มตัวเลือกจัดส่งแล้ว');
      }
      closeForm();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <section aria-labelledby="admin-shipping-store-options-heading" className="space-y-4">
      {successMessage ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-success/25 bg-success-bg px-4 py-3 text-success"
          role="status"
          aria-live="polite"
        >
          <HiOutlineCheckCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-surface/60 px-5 py-5 md:px-6">
          <div className="min-w-0">
            <h2
              id="admin-shipping-store-options-heading"
              className="font-display text-lg font-medium text-ink text-balance"
            >
              ราคาจัดส่งของร้านค้า
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
              กำหนดตัวเลือกและค่าจัดส่งที่ลูกค้าเห็นตอนชำระเงินในแต่ละร้าน
              ราคาและสถานะต้องตรงกับที่ร้านตั้งไว้ — แก้ไขที่นี่มีผลทันที
            </p>
          </div>

          <div className="mt-5 max-w-md border-t border-border pt-5">
            <Label htmlFor="admin-ship-store">เลือกร้านค้า</Label>
            <Select
              value={selectedStoreId}
              onValueChange={(value) => {
                setSelectedStoreId(value);
                closeForm();
                setSuccessMessage(null);
              }}
              disabled={loadingStores}
            >
              <SelectTrigger id="admin-ship-store" className="mt-1.5">
                <SelectValue placeholder={loadingStores ? 'กำลังโหลดร้านค้า...' : 'เลือกร้านค้า'} />
              </SelectTrigger>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              เลือกร้านเพื่อดูและแก้ไขตัวเลือกจัดส่งของร้านนั้น
            </p>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {!selectedStoreId ? (
            <div className="flex flex-col items-center px-5 py-12 text-center md:px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted-foreground">
                <HiOutlineShoppingBag className="size-7" aria-hidden />
              </div>
              <h3 className="font-display text-base font-medium text-ink">เลือกร้านค้าก่อน</h3>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground text-pretty">
                ใช้ตัวเลือกด้านบนเพื่อดูรายการจัดส่งและราคาของร้านที่ต้องการตรวจสอบ
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 md:px-6">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{selectedStore?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {storeOptions.length > 0
                      ? `${storeOptions.length} ตัวเลือก · ใช้งาน ${activeCount}`
                      : 'ยังไม่มีตัวเลือกจัดส่ง'}
                  </p>
                </div>
                <Button type="button" size="sm" onClick={openCreate} className="shrink-0">
                  <HiOutlinePlus className="size-4" aria-hidden />
                  เพิ่มตัวเลือก
                </Button>
              </div>

              {!loadingOptions && storeOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3 md:px-6">
                  <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink">
                    ทั้งหมด {storeOptions.length}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-success/25 bg-success-bg px-3 py-1 text-xs font-medium text-success">
                    ใช้งาน {activeCount}
                  </span>
                  {inactiveCount > 0 ? (
                    <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                      ปิดใช้งาน {inactiveCount}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {loadingOptions ? <StoreOptionsSkeleton /> : null}

              {optionsError ? (
                <div className="px-5 py-8 text-center md:px-6">
                  <p className="text-sm text-danger">
                    {optionsError instanceof Error
                      ? optionsError.message
                      : 'โหลดตัวเลือกจัดส่งไม่สำเร็จ'}
                  </p>
                </div>
              ) : null}

              {!loadingOptions && !optionsError && storeOptions.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-12 text-center md:px-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                    <HiOutlineTruck className="size-7" aria-hidden />
                  </div>
                  <h3 className="font-display text-base font-medium text-ink">
                    ร้านนี้ยังไม่มีตัวเลือกจัดส่ง
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm text-muted-foreground text-pretty">
                    เพิ่มตัวเลือกพร้อมราคา (฿) และผู้ให้บริการ เพื่อให้ลูกค้าสั่งซื้อจากร้านนี้ได้
                  </p>
                  <Button type="button" className="mt-5" onClick={openCreate}>
                    <HiOutlinePlus className="size-4" aria-hidden />
                    เพิ่มตัวเลือกแรก
                  </Button>
                </div>
              ) : null}

              {!loadingOptions && storeOptions.length > 0 ? (
                <ul className="divide-y divide-border">
                  {storeOptions.map((option) => {
                    const provider = providerLabel(providers, option.providerId);
                    return (
                      <li
                        key={option.id}
                        className={cn(
                          'flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6',
                          !option.isActive && 'bg-surface/50',
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-3.5">
                          <div
                            className={cn(
                              'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                              option.isActive
                                ? 'bg-brand-tint text-brand'
                                : 'bg-surface text-muted-foreground',
                            )}
                            aria-hidden
                          >
                            <HiOutlineTruck className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-medium text-ink">{option.name}</p>
                              <Badge className={activeStatusBadgeClass(option.isActive)}>
                                {option.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              <span className="font-medium tabular-nums text-ink">
                                {formatCurrency(option.price)}
                              </span>
                              <span className="mx-1.5 text-border" aria-hidden>
                                ·
                              </span>
                              {provider}
                            </p>
                            {option.description ? (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(option)}
                            disabled={mutationPending}
                          >
                            <HiOutlinePencilSquare className="size-3.5" aria-hidden />
                            แก้ไข
                          </Button>
                          <ConfirmDeleteButton
                            confirmLabel={option.name}
                            title="ลบตัวเลือกจัดส่ง"
                            description={`ลบ “${option.name}” (${formatCurrency(option.price)}) ออกจากร้าน ${selectedStore?.name ?? ''}`}
                            variant="outline"
                            disabled={deleteStoreOption.isPending}
                            isDeleting={deleteStoreOption.isPending}
                            onConfirm={async () => {
                              await deleteStoreOption.mutateAsync({
                                id: option.id,
                                storeId: selectedStoreId,
                              });
                              setSuccessMessage('ลบตัวเลือกจัดส่งแล้ว');
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={showOptionForm}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOption ? 'แก้ไขตัวเลือกจัดส่ง' : 'เพิ่มตัวเลือกจัดส่ง'}
            </DialogTitle>
            <DialogDescription>
              {editingOption
                ? `ปรับราคาและสถานะของ “${editingOption.name}” — มีผลทันทีหลังบันทึก`
                : `ตั้งชื่อ ราคา (฿) และผู้ให้บริการสำหรับร้าน ${selectedStore?.name ?? ''}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="admin-ship-name" required>
                ชื่อตัวเลือก
              </Label>
              <Input
                id="admin-ship-name"
                placeholder="เช่น จัดส่งมาตรฐาน"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'admin-ship-name-error' : undefined}
                {...form.register('name')}
                className="mt-1.5"
              />
              {form.formState.errors.name ? (
                <p id="admin-ship-name-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="admin-ship-price" required>
                  ค่าจัดส่ง (฿)
                </Label>
                <Input
                  id="admin-ship-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  aria-invalid={!!form.formState.errors.price}
                  aria-describedby={
                    form.formState.errors.price ? 'admin-ship-price-error' : undefined
                  }
                  className="mt-1.5 tabular-nums"
                  {...form.register('price', { valueAsNumber: true })}
                />
                {form.formState.errors.price ? (
                  <p id="admin-ship-price-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.price.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="admin-ship-provider">ผู้ให้บริการ</Label>
                <Controller
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <SelectTrigger id="admin-ship-provider" className="mt-1.5">
                        <SelectValue placeholder="เลือกผู้ให้บริการ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                        {activeProviders.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="admin-ship-desc">รายละเอียด (ไม่บังคับ)</Label>
              <Textarea
                id="admin-ship-desc"
                placeholder="เช่น ส่งภายใน 2–3 วันทำการ"
                {...form.register('description')}
                className="mt-1.5"
                rows={2}
              />
            </div>

            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <label
                  htmlFor="admin-ship-active"
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
                >
                  <input
                    id="admin-ship-active"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
                    checked={field.value ?? true}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink">เปิดใช้งาน</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      แสดงตัวเลือกนี้ให้ลูกค้าเลือกตอนชำระเงิน
                    </span>
                  </span>
                </label>
              )}
            />

            {mutationError ? (
              <p className="text-sm text-danger" role="alert">
                {mutationError instanceof Error ? mutationError.message : 'บันทึกไม่สำเร็จ'}
              </p>
            ) : null}

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={mutationPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={mutationPending} aria-busy={mutationPending}>
                {mutationPending
                  ? 'กำลังบันทึก...'
                  : editingOption
                    ? 'บันทึกการแก้ไข'
                    : 'เพิ่มตัวเลือก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
