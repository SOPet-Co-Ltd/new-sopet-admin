'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateShippingOption,
  useDeleteShippingOption,
  useMyStoreShippingOptions,
  useShippingProviders,
  useUpdateShippingOption,
} from '@/hooks/useShipping';
import { shippingOptionSchema, type ShippingOptionFormValues } from '@/lib/validations';
import type { StoreShippingOption } from '@/types';

function providerName(providers: { id: string; name: string }[], providerId?: string): string {
  if (!providerId) return '—';
  return providers.find((p) => p.id === providerId)?.name ?? '—';
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
      } else {
        await createMutation.mutateAsync(input);
      }
      setSuccessMessage('บันทึกแล้ว');
      setEditing(null);
      setShowForm(false);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
  const mutationPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <h2 className="font-display font-medium text-ink">ตัวเลือกการจัดส่ง</h2>
          {!showForm ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              เพิ่มตัวเลือก
            </Button>
          ) : null}
        </CardHeader>
        <CardBody className="space-y-4">
          {isLoading ? <p className="text-sm text-muted">กำลังโหลด...</p> : null}
          {error ? (
            <p className="text-sm text-danger">
              {error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}
            </p>
          ) : null}
          {!isLoading && options.length === 0 && !showForm ? (
            <p className="text-sm text-muted">ยังไม่มีตัวเลือกการจัดส่ง</p>
          ) : null}
          {options.length > 0 ? (
            <ul className="space-y-2">
              {options.map((option) => (
                <li
                  key={option.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">{option.name}</p>
                    <p className="text-sm text-muted">
                      {providerName(providers, option.providerId)} · ฿
                      {option.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{option.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(option);
                        setShowForm(true);
                      }}
                    >
                      แก้ไข
                    </Button>
                    <ConfirmDeleteButton
                      confirmLabel={option.name}
                      title="ลบตัวเลือกจัดส่ง"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
                      isDeleting={deleteMutation.isPending}
                      onConfirm={async () => {
                        await deleteMutation.mutateAsync(option.id);
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </CardBody>
      </Card>

      {showForm ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <h2 className="font-display font-medium text-ink">
              {editing ? 'แก้ไขตัวเลือกการจัดส่ง' : 'เพิ่มตัวเลือกการจัดส่ง'}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="ship-provider">ผู้ให้บริการจัดส่ง</Label>
                <Select
                  value={form.watch('providerId') || ''}
                  onValueChange={(v) => form.setValue('providerId', v === '__none__' ? '' : v)}
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
              </div>
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
              <div>
                <Label htmlFor="ship-price" required>
                  ราคา (฿)
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
                <Label htmlFor="ship-desc">รายละเอียด (ไม่บังคับ)</Label>
                <Textarea
                  id="ship-desc"
                  placeholder="รายละเอียดเพิ่มเติม..."
                  {...form.register('description')}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="ship-active"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={form.watch('isActive') ?? true}
                  onChange={(e) => form.setValue('isActive', e.target.checked)}
                />
                <Label htmlFor="ship-active">เปิดใช้งาน</Label>
              </div>
              {mutationError ? (
                <p className="text-sm text-danger" role="alert">
                  {mutationError instanceof Error ? mutationError.message : 'บันทึกไม่สำเร็จ'}
                </p>
              ) : null}
              {successMessage ? <p className="text-sm text-brand">{successMessage}</p> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={mutationPending} aria-busy={mutationPending}>
                  {mutationPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    form.reset();
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
