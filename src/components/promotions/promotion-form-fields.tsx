'use client';

import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Textarea } from '@/components/ui/textarea';
import type { PromotionTypeMeta } from '@/lib/promotions/metadata';
import type { PromotionFormValues } from '@/lib/validations/promotions';

export function PromotionFormFields({
  register,
  control,
  errors,
  meta,
  idPrefix = 'promo',
}: {
  register: UseFormRegister<PromotionFormValues>;
  control: Control<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
  meta: PromotionTypeMeta;
  idPrefix?: string;
}) {
  const isPercentage = meta.type === 'percentage' || meta.type === 'percentage_shipping_discount';

  const numberRegisterOptions = {
    setValueAs: (value: unknown) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-code`} required>
            รหัสโปรโมชัน
          </Label>
          <Input
            id={`${idPrefix}-code`}
            placeholder="เช่น SUMMER20"
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? `${idPrefix}-code-error` : undefined}
            {...register('code')}
            className="mt-1.5"
          />
          {errors.code ? (
            <p id={`${idPrefix}-code-error`} role="alert" className="mt-1 text-xs text-danger">
              {errors.code.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-name`} required>
            ชื่อโปรโมชัน
          </Label>
          <Input
            id={`${idPrefix}-name`}
            placeholder="เช่น ลดรับฤดูร้อน"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
            {...register('name')}
            className="mt-1.5"
          />
          {errors.name ? (
            <p id={`${idPrefix}-name-error`} role="alert" className="mt-1 text-xs text-danger">
              {errors.name.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-desc`}>รายละเอียด</Label>
        <Textarea
          id={`${idPrefix}-desc`}
          placeholder="รายละเอียดโปรโมชัน (ถ้ามี)"
          {...register('description')}
          className="mt-1.5"
          rows={2}
        />
      </div>

      {meta.showBuyGetFields ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${idPrefix}-buy`} required>
              ซื้อ (ชิ้น)
            </Label>
            <Input
              id={`${idPrefix}-buy`}
              type="number"
              step="1"
              min={1}
              placeholder="2"
              aria-invalid={!!errors.buyQuantity}
              aria-describedby={errors.buyQuantity ? `${idPrefix}-buy-error` : undefined}
              {...register('buyQuantity', numberRegisterOptions)}
              className="mt-1.5"
            />
            {errors.buyQuantity ? (
              <p id={`${idPrefix}-buy-error`} role="alert" className="mt-1 text-xs text-danger">
                {errors.buyQuantity.message}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-get`} required>
              แถม (ชิ้น)
            </Label>
            <Input
              id={`${idPrefix}-get`}
              type="number"
              step="1"
              min={1}
              placeholder="1"
              aria-invalid={!!errors.getQuantity}
              aria-describedby={errors.getQuantity ? `${idPrefix}-get-error` : undefined}
              {...register('getQuantity', numberRegisterOptions)}
              className="mt-1.5"
            />
            {errors.getQuantity ? (
              <p id={`${idPrefix}-get-error`} role="alert" className="mt-1 text-xs text-danger">
                {errors.getQuantity.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div>
        <Label htmlFor={`${idPrefix}-discount`} required>
          {meta.discountLabel}
        </Label>
        <Input
          id={`${idPrefix}-discount`}
          type="number"
          step="1"
          min={0}
          max={isPercentage ? 100 : undefined}
          placeholder="0"
          aria-invalid={!!errors.discountValue}
          aria-describedby={
            errors.discountValue
              ? `${idPrefix}-discount-error`
              : meta.discountHint
                ? `${idPrefix}-discount-hint`
                : undefined
          }
          {...register('discountValue', numberRegisterOptions)}
          className="mt-1.5"
        />
        {meta.discountHint ? (
          <p id={`${idPrefix}-discount-hint`} className="mt-1 text-xs text-muted">
            {meta.discountHint}
          </p>
        ) : null}
        {errors.discountValue ? (
          <p id={`${idPrefix}-discount-error`} role="alert" className="mt-1 text-xs text-danger">
            {errors.discountValue.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-min`}>ยอดซื้อขั้นต่ำ (บาท)</Label>
          <Input
            id={`${idPrefix}-min`}
            type="number"
            step="1"
            min={0}
            placeholder="0"
            aria-invalid={!!errors.minPurchaseAmount}
            aria-describedby={errors.minPurchaseAmount ? `${idPrefix}-min-error` : undefined}
            {...register('minPurchaseAmount', numberRegisterOptions)}
            className="mt-1.5"
          />
          {errors.minPurchaseAmount ? (
            <p id={`${idPrefix}-min-error`} role="alert" className="mt-1 text-xs text-danger">
              {errors.minPurchaseAmount.message}
            </p>
          ) : null}
        </div>
        {meta.showMaxDiscount ? (
          <div>
            <Label htmlFor={`${idPrefix}-max`}>ส่วนลดสูงสุด (บาท)</Label>
            <Input
              id={`${idPrefix}-max`}
              type="number"
              step="1"
              min={0}
              placeholder="ไม่จำกัด"
              aria-invalid={!!errors.maxDiscountAmount}
              aria-describedby={errors.maxDiscountAmount ? `${idPrefix}-max-error` : undefined}
              {...register('maxDiscountAmount', numberRegisterOptions)}
              className="mt-1.5"
            />
            {errors.maxDiscountAmount ? (
              <p id={`${idPrefix}-max-error`} role="alert" className="mt-1 text-xs text-danger">
                {errors.maxDiscountAmount.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-limit`}>จำกัดการใช้ทั้งหมด</Label>
          <Input
            id={`${idPrefix}-limit`}
            type="number"
            step="1"
            min={0}
            placeholder="ไม่จำกัด"
            aria-invalid={!!errors.usageLimit}
            aria-describedby={errors.usageLimit ? `${idPrefix}-limit-error` : undefined}
            {...register('usageLimit', numberRegisterOptions)}
            className="mt-1.5"
          />
          {errors.usageLimit ? (
            <p id={`${idPrefix}-limit-error`} role="alert" className="mt-1 text-xs text-danger">
              {errors.usageLimit.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-per-customer`}>ต่อลูกค้า</Label>
          <Input
            id={`${idPrefix}-per-customer`}
            type="number"
            step="1"
            min={0}
            placeholder="1"
            aria-invalid={!!errors.usagePerCustomer}
            aria-describedby={
              errors.usagePerCustomer ? `${idPrefix}-per-customer-error` : undefined
            }
            {...register('usagePerCustomer', numberRegisterOptions)}
            className="mt-1.5"
          />
          {errors.usagePerCustomer ? (
            <p
              id={`${idPrefix}-per-customer-error`}
              role="alert"
              className="mt-1 text-xs text-danger"
            >
              {errors.usagePerCustomer.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${idPrefix}-starts`}>เริ่มต้น</Label>
          <Controller
            name="startsAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                id={`${idPrefix}-starts`}
                mode="datetime"
                placeholder="เลือกวันและเวลาเริ่มต้น"
                value={field.value ?? ''}
                onChange={field.onChange}
                aria-invalid={!!errors.startsAt}
                aria-describedby={errors.startsAt ? `${idPrefix}-starts-error` : undefined}
                className="mt-1.5"
              />
            )}
          />
          {errors.startsAt ? (
            <p id={`${idPrefix}-starts-error`} role="alert" className="mt-1 text-xs text-danger">
              {errors.startsAt.message}
            </p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-expires`}>สิ้นสุด</Label>
          <Controller
            name="expiresAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                id={`${idPrefix}-expires`}
                mode="datetime"
                placeholder="เลือกวันและเวลาสิ้นสุด"
                value={field.value ?? ''}
                onChange={field.onChange}
                aria-invalid={!!errors.expiresAt}
                aria-describedby={errors.expiresAt ? `${idPrefix}-expires-error` : undefined}
                className="mt-1.5"
              />
            )}
          />
          {errors.expiresAt ? (
            <p id={`${idPrefix}-expires-error`} role="alert" className="mt-1 text-xs text-danger">
              {errors.expiresAt.message}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
