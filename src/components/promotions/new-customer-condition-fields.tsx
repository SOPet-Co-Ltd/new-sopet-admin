'use client';

import type { ReactNode } from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PromotionFormValues } from '@/lib/validations/promotions';
import { cn } from '@/lib/utils';

const DEFAULT_NEW_CUSTOMER_DAYS = 30;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-danger">
      {message}
    </p>
  );
}

function FieldHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1 text-xs text-muted-foreground">
      {children}
    </p>
  );
}

export function NewCustomerConditionFields({
  register,
  control,
  errors,
  setValue,
  getValues,
  idPrefix = 'promo',
}: {
  register: UseFormRegister<PromotionFormValues>;
  control: Control<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
  setValue: UseFormSetValue<PromotionFormValues>;
  getValues: UseFormGetValues<PromotionFormValues>;
  idPrefix?: string;
}) {
  const newCustomerOnly = useWatch({ control, name: 'newCustomerOnly' });
  const sectionId = `${idPrefix}-section-new-customer`;
  const nErrorId = `${idPrefix}-new-customer-days-error`;
  const nHintId = `${idPrefix}-new-customer-days-hint`;

  return (
    <section aria-labelledby={sectionId} className={cn('space-y-4 p-5 md:p-6')}>
      <div>
        <h3 id={sectionId} className="font-display text-sm font-medium text-balance text-ink">
          ลูกค้าใหม่
        </h3>
        <p className="mt-1 max-w-prose text-pretty text-sm text-muted-foreground">
          จำกัดเฉพาะลูกค้าที่เข้าสู่ระบบแล้ว ไม่มีออเดอร์ที่ชำระแล้ว
          และอายุบัญชีไม่เกินจำนวนวันที่กำหนด (นับเป็นชั่วโมงจากวันสร้างบัญชี เวลา UTC)
        </p>
      </div>

      <Controller
        control={control}
        name="newCustomerOnly"
        render={({ field }) => (
          <label
            htmlFor={`${idPrefix}-new-customer-only`}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
          >
            <input
              id={`${idPrefix}-new-customer-only`}
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
              checked={field.value ?? false}
              onChange={(e) => {
                const checked = e.target.checked;
                field.onChange(checked);
                if (checked) {
                  const current = getValues('newCustomerMaxAccountAgeDays');
                  if (current === undefined || current === null) {
                    setValue('newCustomerMaxAccountAgeDays', DEFAULT_NEW_CUSTOMER_DAYS, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }
              }}
              onBlur={field.onBlur}
              ref={field.ref}
              name={field.name}
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                ใช้ได้เฉพาะลูกค้าใหม่ที่ลงทะเบียนแล้ว
              </span>
              {!field.value ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  ปิดอยู่ = ไม่ตรวจสอบเงื่อนไขลูกค้าใหม่
                </span>
              ) : null}
            </span>
          </label>
        )}
      />

      {newCustomerOnly ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor={`${idPrefix}-new-customer-days`} required>
              อายุบัญชีสูงสุด (วัน)
            </Label>
            <Input
              id={`${idPrefix}-new-customer-days`}
              type="number"
              inputMode="numeric"
              step="1"
              min={1}
              placeholder="30"
              aria-invalid={!!errors.newCustomerMaxAccountAgeDays}
              aria-describedby={
                errors.newCustomerMaxAccountAgeDays
                  ? nErrorId
                  : `${nHintId} ${idPrefix}-new-customer-guest-note`
              }
              {...register('newCustomerMaxAccountAgeDays', {
                setValueAs: (value: unknown) => {
                  if (value === '' || value === null || value === undefined) return undefined;
                  const parsed = Number(value);
                  return Number.isNaN(parsed) ? undefined : parsed;
                },
              })}
              className="mt-1.5"
            />
            {!errors.newCustomerMaxAccountAgeDays ? (
              <FieldHint id={nHintId}>
                ระบบตรวจเป็นช่วง N×24 ชั่วโมงจากเวลาสร้างบัญชี (UTC) ไม่ใช่ตัดตามวันปฏิทิน
                ค่าแนะนำเริ่มต้น 30
              </FieldHint>
            ) : null}
            <FieldError id={nErrorId} message={errors.newCustomerMaxAccountAgeDays?.message} />
          </div>
          <p id={`${idPrefix}-new-customer-guest-note`} className="text-xs text-muted-foreground">
            ลูกค้าที่ยังไม่เข้าสู่ระบบจะใช้โปรโมชันนี้ไม่ได้
          </p>
        </div>
      ) : null}
    </section>
  );
}
