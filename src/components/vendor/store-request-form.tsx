'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/useAuth';
import { useSubmitStoreRequest } from '@/hooks/useStoreRequests';
import { getErrorMessage } from '@/lib/api/errors';
import { storeRequestSchema, type StoreRequestFormValues } from '@/lib/validations';

type StoreRequestFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  idPrefix?: string;
};

export function StoreRequestForm({
  onSuccess,
  onCancel,
  showCancel = false,
  idPrefix = 'req',
}: StoreRequestFormProps) {
  const submitMutation = useSubmitStoreRequest();
  const { user } = useCurrentUser();
  const isEmailVerified = user?.emailVerified === true;

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
      // Omit blank optionals — backend @IsOptional skips null/undefined only, not "".
      await submitMutation.mutateAsync({
        storeName: values.storeName.trim(),
        description: values.description?.trim() || undefined,
        contactPhone: values.contactPhone?.trim() || undefined,
        contactEmail: values.contactEmail?.trim() || undefined,
        address: values.address?.trim() || undefined,
        logoUrl: values.logoUrl?.trim() || undefined,
      });
      form.reset();
      onSuccess?.();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
      <p className="sm:col-span-2 text-sm text-muted-foreground text-pretty">
        จำเป็นเฉพาะชื่อร้านค้า (<span className="text-danger">*</span>) —
        โลโก้และข้อมูลติดต่อไม่บังคับ แต่แนะนำให้กรอกเพื่อให้ทีมงานติดต่อและอนุมัติได้เร็วขึ้น
      </p>
      <div className="sm:col-span-2" data-tour-id="action-store-name">
        <Label htmlFor={`${idPrefix}-name`} required>
          ชื่อร้านค้า
        </Label>
        <Input
          id={`${idPrefix}-name`}
          placeholder="เช่น ร้านสัตว์เลี้ยงสุขใจ"
          aria-required
          aria-invalid={!!form.formState.errors.storeName}
          aria-describedby={form.formState.errors.storeName ? `${idPrefix}-name-error` : undefined}
          {...form.register('storeName')}
          className="mt-1.5"
        />
        {form.formState.errors.storeName ? (
          <p id={`${idPrefix}-name-error`} role="alert" className="mt-1 text-xs text-danger">
            {form.formState.errors.storeName.message}
          </p>
        ) : null}
      </div>
      <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2" data-tour-id="action-store-contact">
        <div className="sm:col-span-2">
          <ImageUploadField
            label="โลโก้ร้านค้า (ไม่บังคับ)"
            value={form.watch('logoUrl') ?? ''}
            onChange={(url) => form.setValue('logoUrl', url, { shouldDirty: true })}
            folder="stores"
            showUrl={false}
            disabled={submitMutation.isPending}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-desc`}>รายละเอียด (ไม่บังคับ)</Label>
          <Textarea
            id={`${idPrefix}-desc`}
            placeholder="เช่น ประเภทสินค้า จุดเด่นของร้าน"
            aria-invalid={!!form.formState.errors.description}
            aria-describedby={
              form.formState.errors.description ? `${idPrefix}-desc-error` : undefined
            }
            {...form.register('description')}
            className="mt-1.5"
            rows={3}
          />
          {form.formState.errors.description ? (
            <p id={`${idPrefix}-desc-error`} role="alert" className="mt-1 text-xs text-danger">
              {form.formState.errors.description.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-phone`}>เบอร์โทร (ไม่บังคับ)</Label>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            autoComplete="tel"
            placeholder="0812345678"
            aria-invalid={!!form.formState.errors.contactPhone}
            aria-describedby={
              form.formState.errors.contactPhone ? `${idPrefix}-phone-error` : undefined
            }
            {...form.register('contactPhone')}
            className="mt-1.5"
          />
          {form.formState.errors.contactPhone ? (
            <p id={`${idPrefix}-phone-error`} role="alert" className="mt-1 text-xs text-danger">
              {form.formState.errors.contactPhone.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-email`}>อีเมลติดต่อ (ไม่บังคับ)</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!form.formState.errors.contactEmail}
            aria-describedby={
              form.formState.errors.contactEmail ? `${idPrefix}-email-error` : undefined
            }
            {...form.register('contactEmail')}
            className="mt-1.5"
          />
          {form.formState.errors.contactEmail ? (
            <p id={`${idPrefix}-email-error`} role="alert" className="mt-1 text-xs text-danger">
              {form.formState.errors.contactEmail.message}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`${idPrefix}-address`}>ที่อยู่ (ไม่บังคับ)</Label>
          <Textarea
            id={`${idPrefix}-address`}
            placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
            aria-invalid={!!form.formState.errors.address}
            aria-describedby={
              form.formState.errors.address ? `${idPrefix}-address-error` : undefined
            }
            {...form.register('address')}
            className="mt-1.5"
            rows={2}
          />
          {form.formState.errors.address ? (
            <p id={`${idPrefix}-address-error`} role="alert" className="mt-1 text-xs text-danger">
              {form.formState.errors.address.message}
            </p>
          ) : null}
        </div>
      </div>
      {!isEmailVerified && user?.email ? (
        <p className="sm:col-span-2 text-sm text-muted-foreground">
          กรุณายืนยันอีเมลก่อนส่งคำขอ —{' '}
          <a
            href="#email-verification-banner"
            className="font-medium text-secondary underline-offset-2 hover:underline"
          >
            ดูวิธียืนยัน
          </a>
        </p>
      ) : null}
      <div className="sm:col-span-2 flex flex-wrap gap-3">
        {submitMutation.error ? (
          <p className="mb-2 w-full text-sm text-danger" role="alert">
            {getErrorMessage(submitMutation.error, 'ส่งคำขอไม่สำเร็จ')}
          </p>
        ) : null}
        <Button
          type="submit"
          className="min-h-9"
          disabled={submitMutation.isPending || !isEmailVerified}
          aria-busy={submitMutation.isPending}
          data-tour-id="action-store-submit"
        >
          {submitMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอเปิดร้าน'}
        </Button>
        {showCancel && onCancel ? (
          <Button type="button" variant="outline" className="min-h-9" onClick={onCancel}>
            ยกเลิก
          </Button>
        ) : null}
      </div>
    </form>
  );
}
