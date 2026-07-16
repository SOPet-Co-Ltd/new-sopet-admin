'use client';

import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { HiOutlineCheckCircle } from 'react-icons/hi2';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StoreInfoFormValues } from '@/lib/validations';
import { cn } from '@/lib/utils';

type VendorStoreSettingsPanelProps = {
  form: UseFormReturn<StoreInfoFormValues>;
  loading: boolean;
  saving: boolean;
  onSubmit: (values: StoreInfoFormValues) => Promise<void>;
};

function getStoreInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'S';
}

function StorefrontPreview({
  name,
  description,
  logoUrl,
  bannerUrl,
}: {
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
}) {
  const displayName = name.trim() || 'ชื่อร้านค้า';
  const displayDescription = description.trim();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative h-32 w-full md:h-40">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div aria-hidden className="absolute inset-0 bg-surface" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-ink/10 via-transparent to-transparent"
        />
      </div>
      <div className="relative px-4 pb-4 md:px-5 md:pb-5">
        <div className="-mt-8 flex flex-col gap-3 md:-mt-10 md:flex-row md:items-end md:gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-card bg-brand-tint md:h-20 md:w-20">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-medium text-brand">
                {getStoreInitial(displayName)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 md:pb-0.5">
            <p className="truncate font-display text-lg font-medium text-ink">{displayName}</p>
            {displayDescription ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {displayDescription}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">คำอธิบายร้านค้าจะแสดงที่นี่</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoreSettingsSkeleton() {
  return (
    <div className="space-y-6 p-5 md:p-6" aria-busy="true" aria-live="polite">
      <div className="h-40 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-28 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
        <div className="h-28 animate-pulse rounded-xl bg-surface motion-reduce:animate-none" />
      </div>
      <div className="h-10 w-2/3 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      <div className="h-24 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

export function VendorStoreSettingsPanel({
  form,
  loading,
  saving,
  onSubmit,
}: VendorStoreSettingsPanelProps) {
  const logoUrl = form.watch('logoUrl') ?? '';
  const bannerUrl = form.watch('bannerUrl') ?? '';
  const name = form.watch('name') ?? '';
  const description = form.watch('description') ?? '';
  const [saveFeedback, setSaveFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!saveFeedback || saveFeedback.type !== 'success') return;
    const timer = window.setTimeout(() => setSaveFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [saveFeedback]);

  async function handleSubmit(values: StoreInfoFormValues) {
    setSaveFeedback(null);
    try {
      await onSubmit(values);
      setSaveFeedback({ type: 'success', message: 'บันทึกข้อมูลร้านค้าแล้ว' });
    } catch (err) {
      setSaveFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ',
      });
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border bg-surface/60 px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-medium text-ink text-balance">
              ข้อมูลร้านค้า
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              จัดการภาพลักษณ์และข้อมูลที่ลูกค้าเห็นบนหน้าร้านใน SOPet
            </p>
          </div>
          <Button
            type="submit"
            form="vendor-store-settings-form"
            disabled={saving || loading}
            aria-busy={saving}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลร้าน'}
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {loading ? (
          <StoreSettingsSkeleton />
        ) : (
          <form
            id="vendor-store-settings-form"
            onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
            className="divide-y divide-border"
          >
            <section className="space-y-5 p-5 md:p-6">
              <div>
                <h3 className="font-display text-sm font-medium text-ink">ตัวอย่างหน้าร้าน</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  อัปเดตแบบเรียลไทม์เมื่อคุณเปลี่ยนโลโก้ แบนเนอร์ หรือข้อมูลร้าน
                </p>
              </div>
              <StorefrontPreview
                name={name}
                description={description}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <ImageUploadField
                  label="แบนเนอร์ร้านค้า"
                  value={bannerUrl}
                  onChange={(url) => form.setValue('bannerUrl', url, { shouldDirty: true })}
                  folder="stores"
                  showUrl={false}
                  disabled={saving}
                />
                <ImageUploadField
                  label="โลโก้ร้านค้า"
                  value={logoUrl}
                  onChange={(url) => form.setValue('logoUrl', url, { shouldDirty: true })}
                  folder="stores"
                  showUrl={false}
                  disabled={saving}
                />
              </div>
            </section>

            <section className="grid gap-6 p-5 md:grid-cols-2 md:p-6">
              <div className="md:col-span-2">
                <h3 className="font-display text-sm font-medium text-ink">ข้อมูลพื้นฐาน</h3>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="store-name" required>
                  ชื่อร้านค้า
                </Label>
                <Input
                  id="store-name"
                  placeholder="ชื่อร้านของคุณ"
                  aria-invalid={!!form.formState.errors.name}
                  aria-describedby={form.formState.errors.name ? 'store-name-error' : undefined}
                  {...form.register('name')}
                  className="mt-1.5"
                />
                {form.formState.errors.name ? (
                  <p id="store-name-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="store-description">คำอธิบาย</Label>
                <Textarea
                  id="store-description"
                  placeholder="อธิบายร้านค้า สินค้า และบริการของคุณ..."
                  rows={4}
                  {...form.register('description')}
                  className="mt-1.5"
                />
              </div>
            </section>

            <section className="grid gap-6 p-5 md:grid-cols-2 md:p-6">
              <div className="md:col-span-2">
                <h3 className="font-display text-sm font-medium text-ink">ช่องทางติดต่อ</h3>
              </div>
              <div>
                <Label htmlFor="contactPhone">เบอร์โทร</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0812345678"
                  {...form.register('contactPhone')}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">อีเมลติดต่อ</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="contact@example.com"
                  aria-invalid={!!form.formState.errors.contactEmail}
                  aria-describedby={
                    form.formState.errors.contactEmail ? 'contactEmail-error' : undefined
                  }
                  {...form.register('contactEmail')}
                  className="mt-1.5"
                />
                {form.formState.errors.contactEmail ? (
                  <p id="contactEmail-error" className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.contactEmail.message}
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  placeholder="ที่อยู่ร้านค้า"
                  rows={3}
                  {...form.register('address')}
                  className="mt-1.5"
                />
              </div>
            </section>

            <div
              className={cn(
                'flex flex-col gap-3 border-t border-border bg-surface/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6',
              )}
            >
              {saveFeedback ? (
                <div
                  className={cn(
                    'flex items-start gap-2 text-sm',
                    saveFeedback.type === 'success' ? 'text-success' : 'text-danger',
                  )}
                  role={saveFeedback.type === 'error' ? 'alert' : 'status'}
                  aria-live="polite"
                >
                  {saveFeedback.type === 'success' ? (
                    <HiOutlineCheckCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  ) : null}
                  <p className="font-medium">{saveFeedback.message}</p>
                </div>
              ) : (
                <span className="hidden sm:block" aria-hidden />
              )}
              <Button type="submit" disabled={saving} aria-busy={saving} className="self-end">
                {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลร้าน'}
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
