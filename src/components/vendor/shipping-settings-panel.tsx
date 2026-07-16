'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlinePlus,
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
import {
  useCreateShippingOption,
  useDeleteShippingOption,
  useMyStoreShippingOptions,
  useShippingProviders,
  useUpdateShippingOption,
} from '@/hooks/useShipping';
import { shippingOptionSchema, type ShippingOptionFormValues } from '@/lib/validations';
import { cn, formatCurrency } from '@/lib/utils';
import type { StoreShippingOption } from '@/types';

function providerName(providers: { id: string; name: string }[], providerId?: string): string {
  if (!providerId) return 'ไม่ระบุผู้ให้บริการ';
  return providers.find((p) => p.id === providerId)?.name ?? 'ไม่ระบุผู้ให้บริการ';
}

function ShippingOptionSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-busy="true" aria-live="polite">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-4 md:px-6" aria-hidden>
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-3 w-56 animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
        </li>
      ))}
      <li className="sr-only">กำลังโหลดตัวเลือกการจัดส่ง...</li>
    </ul>
  );
}

export function VendorShippingPanel() {
  const { data: options = [], isLoading, error } = useMyStoreShippingOptions();
  const { data: providers = [] } = useShippingProviders(false);
  const createMutation = useCreateShippingOption();
  const updateMutation = useUpdateShippingOption();
  const deleteMutation = useDeleteShippingOption();
  const [editing, setEditing] = useState<StoreShippingOption | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (!editing) {
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
      name: editing.name,
      description: editing.description ?? '',
      price: editing.price,
      providerId: editing.providerId ?? '',
      isActive: editing.isActive,
    });
  }, [editing, form]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function openCreate() {
    setSuccessMessage(null);
    setEditing(null);
    form.reset({
      name: '',
      description: '',
      price: 0,
      providerId: '',
      isActive: true,
    });
    setShowForm(true);
  }

  function openEdit(option: StoreShippingOption) {
    setSuccessMessage(null);
    setEditing(option);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    form.reset();
  }

  async function onSubmit(values: ShippingOptionFormValues) {
    const input = {
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      providerId: values.providerId || undefined,
      isActive: values.isActive ?? true,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input });
        setSuccessMessage('อัปเดตตัวเลือกการจัดส่งแล้ว');
      } else {
        await createMutation.mutateAsync(input);
        setSuccessMessage('เพิ่มตัวเลือกการจัดส่งแล้ว');
      }
      closeForm();
    } catch {
      // surfaced via mutation state
    }
  }

  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const mutationPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const activeCount = options.filter((o) => o.isActive).length;
  const inactiveCount = options.length - activeCount;

  return (
    <div className="space-y-4">
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

      <Card className="w-full overflow-hidden">
        <CardHeader className="border-b border-border bg-surface/60 px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-medium text-ink text-balance">
                ตัวเลือกการจัดส่ง
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                กำหนดวิธีและค่าจัดส่งที่ลูกค้าเลือกได้ตอนชำระเงิน
                ตัวเลือกที่เปิดใช้งานจะแสดงหน้าร้านทันที
              </p>
            </div>
            <Button type="button" onClick={openCreate} className="shrink-0">
              <HiOutlinePlus className="size-4" aria-hidden />
              เพิ่มตัวเลือก
            </Button>
          </div>

          {!isLoading && options.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink">
                ทั้งหมด {options.length}
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
        </CardHeader>

        <CardBody className="p-0">
          {isLoading ? <ShippingOptionSkeleton /> : null}

          {error ? (
            <div className="px-5 py-8 text-center md:px-6">
              <p className="text-sm text-danger">
                {error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}
              </p>
            </div>
          ) : null}

          {!isLoading && !error && options.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center md:px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                <HiOutlineTruck className="size-7" aria-hidden />
              </div>
              <h3 className="font-display text-base font-medium text-ink">
                ยังไม่มีตัวเลือกการจัดส่ง
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                เพิ่มอย่างน้อย 1 ตัวเลือก เช่น จัดส่งมาตรฐาน หรือจัดส่งด่วน
                เพื่อให้ลูกค้าสั่งซื้อสินค้าได้
              </p>
              <Button type="button" className="mt-5" onClick={openCreate}>
                <HiOutlinePlus className="size-4" aria-hidden />
                เพิ่มตัวเลือกแรก
              </Button>
            </div>
          ) : null}

          {!isLoading && options.length > 0 ? (
            <ul className="divide-y divide-border">
              {options.map((option) => {
                const provider = providerName(providers, option.providerId);
                return (
                  <li
                    key={option.id}
                    className={cn(
                      'flex flex-col gap-4 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between md:px-6',
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
                          <Badge
                            className={
                              option.isActive
                                ? 'border border-success/25 bg-success-bg text-success'
                                : 'border border-border bg-surface text-muted-foreground'
                            }
                          >
                            {option.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-ink">
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
                      >
                        <HiOutlinePencilSquare className="size-3.5" aria-hidden />
                        แก้ไข
                      </Button>
                      <ConfirmDeleteButton
                        confirmLabel={option.name}
                        title="ลบตัวเลือกจัดส่ง"
                        description={`ลบ “${option.name}” ออกจากตัวเลือกที่ลูกค้าเห็นตอนชำระเงิน`}
                        variant="outline"
                        disabled={deleteMutation.isPending}
                        isDeleting={deleteMutation.isPending}
                        onConfirm={async () => {
                          await deleteMutation.mutateAsync(option.id);
                          setSuccessMessage('ลบตัวเลือกการจัดส่งแล้ว');
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardBody>
      </Card>

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'แก้ไขตัวเลือกการจัดส่ง' : 'เพิ่มตัวเลือกการจัดส่ง'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'ปรับชื่อ ราคา หรือสถานะ — การเปลี่ยนแปลงมีผลทันทีหลังบันทึก'
                : 'ตั้งชื่อและค่าจัดส่งให้ชัดเจน เพื่อให้ลูกค้าเลือกวิธีส่งได้ง่าย'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="ship-name" required>
                ชื่อตัวเลือก
              </Label>
              <Input
                id="ship-name"
                placeholder="เช่น จัดส่งมาตรฐาน"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'ship-name-error' : undefined}
                {...form.register('name')}
                className="mt-1.5"
              />
              {form.formState.errors.name ? (
                <p id="ship-name-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ship-price" required>
                  ค่าจัดส่ง (฿)
                </Label>
                <Input
                  id="ship-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  aria-invalid={!!form.formState.errors.price}
                  aria-describedby={form.formState.errors.price ? 'ship-price-error' : undefined}
                  className="mt-1.5"
                  {...form.register('price', { valueAsNumber: true })}
                />
                {form.formState.errors.price ? (
                  <p id="ship-price-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.price.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="ship-provider">ผู้ให้บริการ</Label>
                <Controller
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <Select
                      value={field.value || '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <SelectTrigger id="ship-provider" className="mt-1.5">
                        <SelectValue placeholder="เลือกผู้ให้บริการ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">ไม่ระบุ</SelectItem>
                        {providers.map((p) => (
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
              <Label htmlFor="ship-desc">รายละเอียด (ไม่บังคับ)</Label>
              <Textarea
                id="ship-desc"
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
                  htmlFor="ship-active"
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
                >
                  <input
                    id="ship-active"
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
                {mutationPending ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มตัวเลือก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
