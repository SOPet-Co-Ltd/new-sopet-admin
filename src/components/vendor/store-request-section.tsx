'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMyStoreRequests, useSubmitStoreRequest } from '@/hooks/useStoreRequests';
import { labelStoreRequestStatus } from '@/lib/i18n/th';
import { storeRequestSchema, type StoreRequestFormValues } from '@/lib/validations';

export function StoreRequestSection() {
  const [open, setOpen] = useState(false);
  const { data: requests = [], isLoading, error } = useMyStoreRequests();
  const submitMutation = useSubmitStoreRequest();

  const form = useForm<StoreRequestFormValues>({
    resolver: zodResolver(storeRequestSchema),
    defaultValues: {
      storeName: '',
      description: '',
      contactPhone: '',
      contactEmail: '',
      address: '',
      logoUrl: '',
    },
  });

  async function onSubmit(values: StoreRequestFormValues) {
    try {
      await submitMutation.mutateAsync({
        ...values,
        contactEmail: values.contactEmail || undefined,
        logoUrl: values.logoUrl || undefined,
      });
      form.reset();
      setOpen(false);
    } catch {
      // surfaced via mutation state
    }
  }

  function handleCancel() {
    form.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      {!open ? (
        <Button type="button" onClick={() => setOpen(true)}>
          ขอเปิดร้านใหม่
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ขอเปิดร้านใหม่</h2>
            <p className="mt-1 text-sm text-muted">ส่งคำขอเปิดร้านค้าใหม่บนแพลตฟอร์ม</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="req-name" required>
                  ชื่อร้านค้า
                </Label>
                <Input
                  id="req-name"
                  placeholder="เช่น ร้านสัตว์เลี้ยงสุขใจ"
                  aria-invalid={!!form.formState.errors.storeName}
                  aria-describedby={form.formState.errors.storeName ? 'req-name-error' : undefined}
                  {...form.register('storeName')}
                  className="mt-1.5"
                />
                {form.formState.errors.storeName ? (
                  <p id="req-name-error" role="alert" className="mt-1 text-xs text-danger">
                    {form.formState.errors.storeName.message}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="โลโก้ร้านค้า"
                  value={form.watch('logoUrl') ?? ''}
                  onChange={(url) => form.setValue('logoUrl', url, { shouldDirty: true })}
                  folder="stores"
                  showUrl={false}
                  disabled={submitMutation.isPending}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="req-desc">รายละเอียด</Label>
                <Textarea
                  id="req-desc"
                  aria-invalid={!!form.formState.errors.description}
                  aria-describedby={
                    form.formState.errors.description ? 'req-desc-error' : undefined
                  }
                  {...form.register('description')}
                  className="mt-1.5"
                  rows={3}
                />
                {form.formState.errors.description ? (
                  <p id="req-desc-error" role="alert" className="mt-1 text-xs text-danger">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="req-phone">เบอร์โทร</Label>
                <Input
                  id="req-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0812345678"
                  aria-invalid={!!form.formState.errors.contactPhone}
                  aria-describedby={
                    form.formState.errors.contactPhone ? 'req-phone-error' : undefined
                  }
                  {...form.register('contactPhone')}
                  className="mt-1.5"
                />
                {form.formState.errors.contactPhone ? (
                  <p id="req-phone-error" role="alert" className="mt-1 text-xs text-danger">
                    {form.formState.errors.contactPhone.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="req-email">อีเมลติดต่อ</Label>
                <Input
                  id="req-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!form.formState.errors.contactEmail}
                  aria-describedby={
                    form.formState.errors.contactEmail ? 'req-email-error' : undefined
                  }
                  {...form.register('contactEmail')}
                  className="mt-1.5"
                />
                {form.formState.errors.contactEmail ? (
                  <p id="req-email-error" role="alert" className="mt-1 text-xs text-danger">
                    {form.formState.errors.contactEmail.message}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="req-address">ที่อยู่</Label>
                <Textarea
                  id="req-address"
                  placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                  aria-invalid={!!form.formState.errors.address}
                  aria-describedby={form.formState.errors.address ? 'req-address-error' : undefined}
                  {...form.register('address')}
                  className="mt-1.5"
                  rows={2}
                />
                {form.formState.errors.address ? (
                  <p id="req-address-error" role="alert" className="mt-1 text-xs text-danger">
                    {form.formState.errors.address.message}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-3">
                {submitMutation.error ? (
                  <p className="mb-2 w-full text-sm text-danger">
                    {submitMutation.error instanceof Error
                      ? submitMutation.error.message
                      : 'ส่งคำขอไม่สำเร็จ'}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  aria-busy={submitMutation.isPending}
                >
                  {submitMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอเปิดร้าน'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">คำขอเปิดร้าน ({requests.length})</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : error ? (
            <p className="text-sm text-danger">
              {error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}
            </p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีคำขอ</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="rounded-lg border border-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{req.name}</p>
                  <Badge>{labelStoreRequestStatus(req.status)}</Badge>
                </div>
                {req.description ? (
                  <p className="mt-1 text-sm text-muted">{req.description}</p>
                ) : null}
                {req.rejectionReason ? (
                  <p className="mt-2 text-sm text-danger">เหตุผล: {req.rejectionReason}</p>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
