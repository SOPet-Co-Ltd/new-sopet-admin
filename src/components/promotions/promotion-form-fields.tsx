'use client';

import * as React from 'react';
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { BxGyProductPicker } from '@/components/promotions/bxgy-product-picker';
import { LoggedInOnlyConditionFields } from '@/components/promotions/logged-in-only-condition-fields';
import { NewCustomerConditionFields } from '@/components/promotions/new-customer-condition-fields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Textarea } from '@/components/ui/textarea';
import type { PromotionTypeMeta } from '@/lib/promotions/metadata';
import type { PromotionFormValues } from '@/lib/validations/promotions';
import { cn } from '@/lib/utils';

function formatBxgyRuleSummary(buyQuantity?: number, getQuantity?: number): string {
  const buy = typeof buyQuantity === 'number' && buyQuantity >= 1 ? buyQuantity : null;
  const get = typeof getQuantity === 'number' && getQuantity >= 1 ? getQuantity : null;
  if (buy !== null && get !== null) {
    return `สรุปกฎ: ซื้อ ${buy} แถม ${get} — ต้องมีอย่างน้อย ${buy + get} ชิ้นของสินค้าที่เลือกเพื่อได้แถม ${get} ชิ้น`;
  }
  if (buy !== null) {
    return `สรุปกฎ: ซื้อ ${buy} — ยังไม่ได้กำหนดจำนวนแถม`;
  }
  if (get !== null) {
    return `สรุปกฎ: แถม ${get} — ยังไม่ได้กำหนดจำนวนที่ต้องซื้อ`;
  }
  return 'สรุปกฎ: กรอกจำนวนซื้อและจำนวนแถมเพื่อดูตัวอย่าง';
}

function FormSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn('space-y-4 p-5 md:p-6', className)}>
      <div>
        <h3 id={id} className="font-display text-sm font-medium text-balance text-ink">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 max-w-prose text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-danger">
      {message}
    </p>
  );
}

function FieldHint({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1 text-xs text-muted-foreground">
      {children}
    </p>
  );
}

const AdornedNumberInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & {
    prefix?: string;
    suffix?: string;
    wrapperClassName?: string;
  }
>(function AdornedNumberInput({ id, prefix, suffix, wrapperClassName, className, ...props }, ref) {
  return (
    <div className={cn('relative mt-1.5', wrapperClassName)}>
      {prefix ? (
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground"
          aria-hidden="true"
        >
          {prefix}
        </span>
      ) : null}
      <Input
        id={id}
        ref={ref}
        className={cn(prefix && 'pl-8', suffix && 'pr-8', className)}
        {...props}
      />
      {suffix ? (
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground"
          aria-hidden="true"
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
});

export function PromotionFormFields({
  register,
  control,
  errors,
  meta,
  scope,
  setValue,
  getValues,
  idPrefix = 'promo',
}: {
  register: UseFormRegister<PromotionFormValues>;
  control: Control<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
  meta: PromotionTypeMeta;
  scope: 'platform' | 'store';
  setValue: UseFormSetValue<PromotionFormValues>;
  getValues: UseFormGetValues<PromotionFormValues>;
  idPrefix?: string;
}) {
  const isProductPercentage = meta.type === 'percentage';
  const isShippingPercentage = meta.type === 'percentage_shipping_discount';
  const isPercentage = isProductPercentage || isShippingPercentage;
  const showDiscountField = meta.showDiscountField !== false;
  const isFreeShipping = meta.type === 'free_shipping';
  const isBxgy = meta.showBuyGetFields;
  const isMoneyDiscount = meta.type === 'fixed_amount' || meta.type === 'fixed_shipping_discount';
  const buyQuantity = useWatch({ control, name: 'buyQuantity' });
  const getQuantity = useWatch({ control, name: 'getQuantity' });
  const productId = useWatch({ control, name: 'productId' });
  const productName = useWatch({ control, name: 'productName' });

  const fixedAmountDiscountLabel =
    meta.type === 'fixed_amount'
      ? scope === 'platform'
        ? 'ส่วนลดทั้งออเดอร์ (฿)'
        : 'ส่วนลดยอดร้าน (฿)'
      : meta.discountLabel;

  const numberRegisterOptions = {
    setValueAs: (value: unknown) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
  };

  const integerQuantityRegisterOptions = {
    setValueAs: (value: unknown) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      if (Number.isNaN(parsed)) return undefined;
      return Math.trunc(parsed);
    },
  };

  const discountDescribedBy = errors.discountValue
    ? `${idPrefix}-discount-error`
    : meta.discountHint
      ? `${idPrefix}-discount-hint`
      : undefined;

  const minDescribedBy = errors.minPurchaseAmount
    ? `${idPrefix}-min-error`
    : meta.minPurchaseHint
      ? `${idPrefix}-min-hint`
      : undefined;

  const maxDescribedBy = errors.maxDiscountAmount
    ? `${idPrefix}-max-error`
    : meta.maxDiscountHint
      ? `${idPrefix}-max-hint`
      : undefined;

  const basicsId = `${idPrefix}-section-basics`;
  const rulesId = `${idPrefix}-section-rules`;
  const usageId = `${idPrefix}-section-usage`;
  const scheduleId = `${idPrefix}-section-schedule`;

  return (
    <>
      <FormSection
        id={basicsId}
        title="ข้อมูลโปรโมชัน"
        description="รหัสและชื่อที่ลูกค้าเห็นตอนชำระเงิน"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${idPrefix}-code`} required>
              รหัสโปรโมชัน
            </Label>
            <Input
              id={`${idPrefix}-code`}
              placeholder={
                meta.type === 'buy_x_get_y'
                  ? 'เช่น BUY2GET1'
                  : meta.type === 'fixed_amount'
                    ? 'เช่น SAVE50'
                    : isShippingPercentage
                      ? 'เช่น SHIP50PCT'
                      : meta.type === 'fixed_shipping_discount'
                        ? 'เช่น SHIP50'
                        : meta.type === 'free_shipping'
                          ? 'เช่น FREESHIP'
                          : meta.type === 'percentage'
                            ? 'เช่น SAVE20'
                            : 'เช่น SUMMER20'
              }
              autoComplete="off"
              spellCheck={false}
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? `${idPrefix}-code-error` : undefined}
              {...register('code')}
              className="mt-1.5"
            />
            <FieldError id={`${idPrefix}-code-error`} message={errors.code?.message} />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-name`} required>
              ชื่อโปรโมชัน
            </Label>
            <Input
              id={`${idPrefix}-name`}
              placeholder={
                meta.type === 'buy_x_get_y'
                  ? 'เช่น ซื้อ 2 แถม 1'
                  : meta.type === 'fixed_amount'
                    ? 'เช่น ลด 50 บาท'
                    : isShippingPercentage
                      ? 'เช่น ลดค่าส่ง 50%'
                      : meta.type === 'fixed_shipping_discount'
                        ? 'เช่น ลดค่าส่ง 50 บาท'
                        : meta.type === 'free_shipping'
                          ? 'เช่น จัดส่งฟรีเมื่อครบ 500'
                          : meta.type === 'percentage'
                            ? 'เช่น ลด 20% ทั้งร้าน'
                            : 'เช่น ลดรับฤดูร้อน'
              }
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
              {...register('name')}
              className="mt-1.5"
            />
            <FieldError id={`${idPrefix}-name-error`} message={errors.name?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor={`${idPrefix}-desc`}>รายละเอียด</Label>
          <Textarea
            id={`${idPrefix}-desc`}
            placeholder={
              meta.type === 'buy_x_get_y'
                ? 'เช่น ซื้ออาหารแมวครบ 2 ชิ้น แถม 1 ชิ้น'
                : meta.type === 'fixed_amount'
                  ? 'เช่น ลดทันที 50 บาท เมื่อซื้อครบ 300 บาท'
                  : isShippingPercentage
                    ? 'เช่น ลดค่าจัดส่ง 50% เมื่อซื้อครบ 300 บาท'
                    : meta.type === 'fixed_shipping_discount'
                      ? 'เช่น ลดค่าจัดส่ง 50 บาท เมื่อซื้อครบ 300 บาท'
                      : meta.type === 'free_shipping'
                        ? 'เช่น จัดส่งฟรีเมื่อซื้อครบ 500 บาท'
                        : meta.type === 'percentage'
                          ? 'เช่น ลด 20% สินค้าทุกชิ้นในร้าน ถึงสิ้นเดือน'
                          : 'รายละเอียดโปรโมชัน (ถ้ามี)'
            }
            {...register('description')}
            className="mt-1.5"
            rows={2}
          />
        </div>
      </FormSection>

      <FormSection
        id={rulesId}
        title={
          isBxgy
            ? 'เงื่อนไขซื้อแถม'
            : isFreeShipping
              ? 'เงื่อนไขจัดส่งฟรี'
              : (meta.rulesSectionTitle ?? 'เงื่อนไขส่วนลด')
        }
        description={
          isBxgy
            ? (meta.buyGetRuleHint ??
              'กำหนดจำนวนชิ้นที่ต้องซื้อ และจำนวนที่แถมฟรีเมื่อครบเงื่อนไขในตะกร้า')
            : isFreeShipping
              ? 'ยกเว้นค่าจัดส่งทั้งจำนวนเมื่อครบยอดขั้นต่ำ — ไม่หักจากราคาสินค้า'
              : (meta.rulesSectionDescription ??
                (meta.type === 'fixed_amount'
                  ? 'กำหนดจำนวนบาทที่หักจากยอดสินค้า และยอดซื้อขั้นต่ำ (ถ้ามี)'
                  : isProductPercentage
                    ? 'กำหนดเปอร์เซ็นต์ส่วนลดจากยอดสินค้า ยอดขั้นต่ำ และเพดานส่วนลดเป็นบาท (ถ้ามี)'
                    : meta.type === 'fixed_shipping_discount'
                      ? 'ลดเฉพาะค่าจัดส่งเป็นบาทคงที่ — ไม่หักจากราคาสินค้า'
                      : 'กำหนดมูลค่าส่วนลดและยอดซื้อขั้นต่ำให้ชัดเจน'))
        }
      >
        {isBxgy ? (
          <div className="space-y-4">
            <BxGyProductPicker
              scope={scope}
              value={productId ?? ''}
              initialLabel={productName}
              error={errors.productId?.message}
              idPrefix={idPrefix}
              aria-invalid={!!errors.productId}
              onChange={(id, label) => {
                setValue('productId', id || undefined, { shouldValidate: true, shouldDirty: true });
                setValue('productName', label || undefined, { shouldDirty: true });
              }}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${idPrefix}-buy`} required>
                  {meta.buyQuantityLabel ?? 'จำนวนที่ต้องซื้อ (ชิ้น)'}
                </Label>
                <Input
                  id={`${idPrefix}-buy`}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={1}
                  max={99}
                  placeholder="2"
                  aria-invalid={!!errors.buyQuantity}
                  aria-describedby={
                    errors.buyQuantity
                      ? `${idPrefix}-buy-error`
                      : meta.buyQuantityHint
                        ? `${idPrefix}-buy-hint`
                        : undefined
                  }
                  {...register('buyQuantity', integerQuantityRegisterOptions)}
                  className="mt-1.5"
                />
                {meta.buyQuantityHint && !errors.buyQuantity ? (
                  <FieldHint id={`${idPrefix}-buy-hint`}>{meta.buyQuantityHint}</FieldHint>
                ) : null}
                <FieldError id={`${idPrefix}-buy-error`} message={errors.buyQuantity?.message} />
              </div>
              <div>
                <Label htmlFor={`${idPrefix}-get`} required>
                  {meta.getQuantityLabel ?? 'จำนวนที่แถมฟรี (ชิ้น)'}
                </Label>
                <Input
                  id={`${idPrefix}-get`}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={1}
                  max={99}
                  placeholder="1"
                  aria-invalid={!!errors.getQuantity}
                  aria-describedby={
                    errors.getQuantity
                      ? `${idPrefix}-get-error`
                      : meta.getQuantityHint
                        ? `${idPrefix}-get-hint`
                        : undefined
                  }
                  {...register('getQuantity', integerQuantityRegisterOptions)}
                  className="mt-1.5"
                />
                {meta.getQuantityHint && !errors.getQuantity ? (
                  <FieldHint id={`${idPrefix}-get-hint`}>{meta.getQuantityHint}</FieldHint>
                ) : null}
                <FieldError id={`${idPrefix}-get-error`} message={errors.getQuantity?.message} />
              </div>
            </div>
            <p
              className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-ink"
              aria-live="polite"
            >
              {formatBxgyRuleSummary(buyQuantity, getQuantity)}
            </p>
          </div>
        ) : null}

        {showDiscountField && meta.type === 'fixed_amount' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor={`${idPrefix}-discount`} required={meta.discountRequired}>
                {fixedAmountDiscountLabel}
              </Label>
              <AdornedNumberInput
                id={`${idPrefix}-discount`}
                type="number"
                inputMode="decimal"
                step="1"
                min={1}
                prefix="฿"
                placeholder={meta.discountPlaceholder ?? 'เช่น 50'}
                aria-invalid={!!errors.discountValue}
                aria-describedby={discountDescribedBy}
                {...register('discountValue', numberRegisterOptions)}
              />
              {meta.discountHint ? (
                <FieldHint id={`${idPrefix}-discount-hint`}>{meta.discountHint}</FieldHint>
              ) : null}
              <FieldError
                id={`${idPrefix}-discount-error`}
                message={errors.discountValue?.message}
              />
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-min`}>
                {meta.minPurchaseLabel ?? 'ยอดซื้อขั้นต่ำ (บาท)'}
              </Label>
              <AdornedNumberInput
                id={`${idPrefix}-min`}
                type="number"
                inputMode="decimal"
                step="1"
                min={0}
                prefix="฿"
                placeholder={meta.minPurchasePlaceholder ?? 'เช่น 300'}
                aria-invalid={!!errors.minPurchaseAmount}
                aria-describedby={minDescribedBy}
                {...register('minPurchaseAmount', numberRegisterOptions)}
              />
              {meta.minPurchaseHint ? (
                <FieldHint id={`${idPrefix}-min-hint`}>{meta.minPurchaseHint}</FieldHint>
              ) : null}
              <FieldError
                id={`${idPrefix}-min-error`}
                message={errors.minPurchaseAmount?.message}
              />
            </div>
          </div>
        ) : null}

        {showDiscountField && meta.type !== 'fixed_amount' ? (
          <div>
            <Label htmlFor={`${idPrefix}-discount`} required={meta.discountRequired}>
              {meta.discountLabel}
            </Label>
            {isPercentage || isMoneyDiscount ? (
              <AdornedNumberInput
                id={`${idPrefix}-discount`}
                type="number"
                inputMode="decimal"
                step="1"
                min={isShippingPercentage || meta.type === 'fixed_shipping_discount' ? 1 : 0}
                max={isPercentage ? 100 : undefined}
                prefix={isMoneyDiscount ? '฿' : undefined}
                suffix={isPercentage ? '%' : undefined}
                placeholder={
                  meta.discountPlaceholder ??
                  (isShippingPercentage
                    ? 'เช่น 50'
                    : meta.type === 'fixed_shipping_discount'
                      ? 'เช่น 50'
                      : isProductPercentage
                        ? 'เช่น 20'
                        : '0')
                }
                aria-invalid={!!errors.discountValue}
                aria-describedby={discountDescribedBy}
                {...register('discountValue', numberRegisterOptions)}
              />
            ) : (
              <Input
                id={`${idPrefix}-discount`}
                type="number"
                inputMode="decimal"
                step="1"
                min={0}
                placeholder={meta.discountPlaceholder ?? '0'}
                aria-invalid={!!errors.discountValue}
                aria-describedby={discountDescribedBy}
                {...register('discountValue', numberRegisterOptions)}
                className="mt-1.5"
              />
            )}
            {meta.discountHint ? (
              <FieldHint id={`${idPrefix}-discount-hint`}>{meta.discountHint}</FieldHint>
            ) : null}
            <FieldError id={`${idPrefix}-discount-error`} message={errors.discountValue?.message} />
          </div>
        ) : null}

        {!showDiscountField ? (
          <input
            type="hidden"
            {...register('discountValue', {
              setValueAs: () => 0,
            })}
          />
        ) : null}

        {meta.type !== 'fixed_amount' ? (
          <div className={meta.showMaxDiscount ? 'grid gap-4 sm:grid-cols-2' : undefined}>
            <div>
              <Label htmlFor={`${idPrefix}-min`}>
                {meta.minPurchaseLabel ?? 'ยอดซื้อขั้นต่ำ (บาท)'}
              </Label>
              {isMoneyDiscount || isPercentage || isFreeShipping ? (
                <AdornedNumberInput
                  id={`${idPrefix}-min`}
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min={0}
                  prefix="฿"
                  placeholder={
                    meta.minPurchasePlaceholder ?? (isFreeShipping ? 'เช่น 500' : 'เช่น 300')
                  }
                  aria-invalid={!!errors.minPurchaseAmount}
                  aria-describedby={minDescribedBy}
                  {...register('minPurchaseAmount', numberRegisterOptions)}
                />
              ) : (
                <Input
                  id={`${idPrefix}-min`}
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min={0}
                  placeholder={meta.minPurchasePlaceholder ?? (isFreeShipping ? 'เช่น 500' : '0')}
                  aria-invalid={!!errors.minPurchaseAmount}
                  aria-describedby={minDescribedBy}
                  {...register('minPurchaseAmount', numberRegisterOptions)}
                  className="mt-1.5"
                />
              )}
              {meta.minPurchaseHint ? (
                <FieldHint id={`${idPrefix}-min-hint`}>{meta.minPurchaseHint}</FieldHint>
              ) : null}
              <FieldError
                id={`${idPrefix}-min-error`}
                message={errors.minPurchaseAmount?.message}
              />
            </div>
            {meta.showMaxDiscount ? (
              <div>
                <Label htmlFor={`${idPrefix}-max`}>
                  {meta.maxDiscountLabel ?? 'ส่วนลดสูงสุด (บาท)'}
                </Label>
                <AdornedNumberInput
                  id={`${idPrefix}-max`}
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min={0}
                  prefix="฿"
                  placeholder="ไม่จำกัด"
                  aria-invalid={!!errors.maxDiscountAmount}
                  aria-describedby={maxDescribedBy}
                  {...register('maxDiscountAmount', numberRegisterOptions)}
                />
                {meta.maxDiscountHint ? (
                  <FieldHint id={`${idPrefix}-max-hint`}>{meta.maxDiscountHint}</FieldHint>
                ) : null}
                <FieldError
                  id={`${idPrefix}-max-error`}
                  message={errors.maxDiscountAmount?.message}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </FormSection>

      <FormSection
        id={usageId}
        title="จำกัดการใช้"
        description="ควบคุมจำนวนครั้งทั้งหมดและต่อลูกค้าหนึ่งคน"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${idPrefix}-limit`}>จำกัดการใช้ทั้งหมด</Label>
            <Input
              id={`${idPrefix}-limit`}
              type="number"
              inputMode="numeric"
              step="1"
              min={0}
              placeholder="ไม่จำกัด"
              aria-invalid={!!errors.usageLimit}
              aria-describedby={errors.usageLimit ? `${idPrefix}-limit-error` : undefined}
              {...register('usageLimit', numberRegisterOptions)}
              className="mt-1.5"
            />
            <FieldError id={`${idPrefix}-limit-error`} message={errors.usageLimit?.message} />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-per-customer`}>ต่อลูกค้า</Label>
            <Input
              id={`${idPrefix}-per-customer`}
              type="number"
              inputMode="numeric"
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
            <FieldError
              id={`${idPrefix}-per-customer-error`}
              message={errors.usagePerCustomer?.message}
            />
          </div>
        </div>
      </FormSection>

      <LoggedInOnlyConditionFields control={control} idPrefix={idPrefix} />

      <NewCustomerConditionFields
        register={register}
        control={control}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
        idPrefix={idPrefix}
      />

      <FormSection
        id={scheduleId}
        title="ระยะเวลา"
        description="เว้นว่างได้ — โปรโมชันจะใช้ได้จนกว่าจะปิดเอง"
      >
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
            <FieldError id={`${idPrefix}-starts-error`} message={errors.startsAt?.message} />
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
            <FieldError id={`${idPrefix}-expires-error`} message={errors.expiresAt?.message} />
          </div>
        </div>
      </FormSection>
    </>
  );
}
