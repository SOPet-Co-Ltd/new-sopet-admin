'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { HiArrowLeft, HiOutlineExclamationCircle, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import { BxGyProductPicker } from '@/components/promotions/bxgy-product-picker';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  buildSaleCampaignItemsInput,
  getSaleCampaignFormDefaults,
  getSaleCampaignFormValuesFromCampaign,
  saleCampaignFormSchema,
  type SaleCampaignFormValues,
} from '@/lib/validations/sale-campaigns';
import { cn } from '@/lib/utils';
import type { SaleCampaign } from '@/types';

export type SaleCampaignSubmitValues = {
  name: string;
  description?: string;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  priority?: number;
  items: ReturnType<typeof buildSaleCampaignItemsInput>;
};

function FormSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-4 p-5 md:p-6">
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

export function SaleCampaignForm({
  campaign,
  backHref,
  listHref,
  title,
  isPending,
  onSubmit,
}: {
  campaign?: SaleCampaign;
  backHref?: string;
  listHref: string;
  title: string;
  isPending: boolean;
  onSubmit: (input: SaleCampaignSubmitValues) => Promise<void>;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedOnly, setPublishedOnly] = useState(false);
  const isEdit = !!campaign;

  const form = useForm<SaleCampaignFormValues>({
    resolver: zodResolver(saleCampaignFormSchema),
    defaultValues: campaign
      ? getSaleCampaignFormValuesFromCampaign(campaign)
      : getSaleCampaignFormDefaults(),
  });

  useEffect(() => {
    if (campaign) {
      form.reset(getSaleCampaignFormValuesFromCampaign(campaign));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  const { control, register, formState, setValue, handleSubmit } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  async function handleFormSubmit(values: SaleCampaignFormValues) {
    setSubmitError(null);
    try {
      await onSubmit({
        name: values.name,
        description: values.description || undefined,
        startsAt: values.startsAt || undefined,
        expiresAt: values.expiresAt || undefined,
        isActive: values.isActive,
        priority: values.priority,
        items: buildSaleCampaignItemsInput(values),
      });
      router.push(listHref);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'บันทึกแคมเปญไม่สำเร็จ กรุณาลองอีกครั้ง',
      );
    }
  }

  const numberRegisterOptions = {
    setValueAs: (value: unknown) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
  };

  const basicsId = 'campaign-section-basics';
  const itemsId = 'campaign-section-items';
  const scheduleId = 'campaign-section-schedule';

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={title}
        description="ลดราคาสินค้าที่เลือกโดยตรง ไม่ต้องใช้โค้ดส่วนลด"
        back={
          backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-brand motion-reduce:transition-none"
            >
              <HiArrowLeft className="size-3.5" aria-hidden="true" />
              กลับไปรายการแคมเปญ
            </Link>
          ) : undefined
        }
      />

      <Card>
        <CardBody className="p-0">
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="divide-y divide-border"
            noValidate
            aria-busy={isPending}
          >
            <FormSection
              id={basicsId}
              title="ข้อมูลแคมเปญ"
              description="แคมเปญใช้แสดงราคาขีดฆ่า/% บนหน้าร้านเท่านั้น — ราคาขายสินค้าคือราคาที่ลูกค้าชำระ ส่วนลดตอนเช็คเอาต์ใช้เมนูโปรโมชัน"
            >
              <div>
                <Label htmlFor="campaign-name" required>
                  ชื่อแคมเปญ
                </Label>
                <Input
                  id="campaign-name"
                  placeholder="เช่น ลดราคาส่งท้ายปี"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'campaign-name-error' : undefined}
                  {...register('name')}
                  className="mt-1.5"
                />
                <FieldError id="campaign-name-error" message={errors.name?.message} />
              </div>

              <div>
                <Label htmlFor="campaign-desc">รายละเอียด</Label>
                <Textarea
                  id="campaign-desc"
                  placeholder="รายละเอียดแคมเปญ (ถ้ามี)"
                  {...register('description')}
                  className="mt-1.5"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="campaign-priority">ลำดับความสำคัญ</Label>
                  <Input
                    id="campaign-priority"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    placeholder="0"
                    aria-invalid={!!errors.priority}
                    aria-describedby={errors.priority ? 'campaign-priority-error' : undefined}
                    {...register('priority', numberRegisterOptions)}
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    ตัวเลขสูงกว่าจะถูกใช้ก่อนเมื่อสินค้าซ้อนกันหลายแคมเปญ
                  </p>
                  <FieldError id="campaign-priority-error" message={errors.priority?.message} />
                </div>

                <div className="flex items-end">
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <label
                        htmlFor="campaign-active"
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 transition-colors hover:bg-surface"
                      >
                        <input
                          id="campaign-active"
                          type="checkbox"
                          className="h-4 w-4 rounded border-border accent-brand"
                          checked={field.value ?? true}
                          onChange={(e) => field.onChange(e.target.checked)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                        />
                        <span className="text-sm font-medium text-ink">เปิดใช้งานแคมเปญ</span>
                      </label>
                    )}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              id={itemsId}
              title="สินค้าในแคมเปญ"
              description="เลือกราคาเปรียบเทียบหรือ % เพื่อแสดงเทียบกับราคาขายปัจจุบัน (ไม่ได้เปลี่ยนราคาที่ชำระ)"
            >
              <div className="space-y-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-brand focus-visible:ring-brand/30"
                    checked={publishedOnly}
                    onChange={(event) => setPublishedOnly(event.target.checked)}
                  />
                  แสดงเฉพาะสินค้าที่เผยแพร่แล้ว
                </label>

                {fields.map((field, index) => {
                  const itemErrors = errors.items?.[index];
                  return (
                    <div
                      key={field.id}
                      className="space-y-3 rounded-xl border border-border bg-surface/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          สินค้าที่ {index + 1}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label={`ลบสินค้าที่ ${index + 1}`}
                          onClick={() => remove(index)}
                        >
                          <HiOutlineTrash className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>

                      <Controller
                        control={control}
                        name={`items.${index}.productId`}
                        render={({ field: productField }) => (
                          <BxGyProductPicker
                            scope="store"
                            productFilter={publishedOnly ? 'published' : 'campaign'}
                            label="สินค้าในแคมเปญ"
                            hint={
                              publishedOnly
                                ? 'ใช้กับทุก SKU — แสดงเฉพาะสินค้าที่เผยแพร่แล้ว'
                                : 'ใช้กับทุก SKU — รวมร่างและเผยแพร่แล้ว (สินค้าสถานะร่างจะมีป้าย “ร่าง”)'
                            }
                            value={productField.value}
                            initialLabel={form.getValues(`items.${index}.productName`)}
                            error={itemErrors?.productId?.message}
                            idPrefix={`campaign-item-${index}`}
                            aria-invalid={!!itemErrors?.productId}
                            onChange={(id, label) => {
                              productField.onChange(id);
                              setValue(`items.${index}.productName`, label || undefined, {
                                shouldDirty: true,
                              });
                            }}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name={`items.${index}.discountType`}
                        render={({ field: discountTypeField }) => (
                          <div className="space-y-3">
                            <div
                              role="radiogroup"
                              aria-label={`รูปแบบส่วนลดสินค้าที่ ${index + 1}`}
                              className="grid grid-cols-2 gap-2"
                            >
                              {(
                                [
                                  { value: 'compare_at' as const, label: 'ราคาเปรียบเทียบ (บาท)' },
                                  { value: 'percent' as const, label: 'ส่วนลด (%)' },
                                ] as const
                              ).map((option) => {
                                const selected = discountTypeField.value === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    className={cn(
                                      'rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-150',
                                      selected
                                        ? 'border-brand bg-brand-tint text-brand'
                                        : 'border-border bg-card text-ink hover:bg-surface',
                                    )}
                                    onClick={() => {
                                      if (selected) return;
                                      discountTypeField.onChange(option.value);
                                      if (option.value === 'compare_at') {
                                        setValue(`items.${index}.discountPercent`, undefined, {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        });
                                      } else {
                                        setValue(`items.${index}.compareAtPrice`, undefined, {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        });
                                      }
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>

                            {discountTypeField.value === 'compare_at' ? (
                              <div>
                                <Label htmlFor={`campaign-item-${index}-compare`}>
                                  ราคาเปรียบเทียบ (บาท)
                                </Label>
                                <Input
                                  id={`campaign-item-${index}-compare`}
                                  type="number"
                                  inputMode="decimal"
                                  step="1"
                                  min={0}
                                  placeholder="เช่น 199"
                                  aria-invalid={!!itemErrors?.compareAtPrice}
                                  {...register(
                                    `items.${index}.compareAtPrice`,
                                    numberRegisterOptions,
                                  )}
                                  className="mt-1.5"
                                />
                                <FieldError
                                  id={`campaign-item-${index}-compare-error`}
                                  message={itemErrors?.compareAtPrice?.message}
                                />
                              </div>
                            ) : (
                              <div>
                                <Label htmlFor={`campaign-item-${index}-discount`}>
                                  ส่วนลด (%)
                                </Label>
                                <Input
                                  id={`campaign-item-${index}-discount`}
                                  type="number"
                                  inputMode="decimal"
                                  step="1"
                                  min={1}
                                  max={99}
                                  placeholder="เช่น 20"
                                  aria-invalid={!!itemErrors?.discountPercent}
                                  {...register(
                                    `items.${index}.discountPercent`,
                                    numberRegisterOptions,
                                  )}
                                  className="mt-1.5"
                                />
                                <FieldError
                                  id={`campaign-item-${index}-discount-error`}
                                  message={itemErrors?.discountPercent?.message}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  );
                })}

                {errors.items?.message ? (
                  <p role="alert" className="text-xs text-danger">
                    {errors.items.message}
                  </p>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    append({
                      productId: '',
                      productName: undefined,
                      discountType: 'percent',
                      compareAtPrice: undefined,
                      discountPercent: undefined,
                    })
                  }
                >
                  <HiOutlinePlus className="size-4" aria-hidden="true" />
                  เพิ่มสินค้า
                </Button>
              </div>
            </FormSection>

            <FormSection
              id={scheduleId}
              title="ระยะเวลา"
              description="เว้นว่างได้ — แคมเปญจะใช้ได้จนกว่าจะปิดเอง"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="campaign-starts">เริ่มต้น</Label>
                  <Controller
                    name="startsAt"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        id="campaign-starts"
                        mode="datetime"
                        placeholder="เลือกวันและเวลาเริ่มต้น"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        aria-invalid={!!errors.startsAt}
                        aria-describedby={errors.startsAt ? 'campaign-starts-error' : undefined}
                        className="mt-1.5"
                      />
                    )}
                  />
                  <FieldError id="campaign-starts-error" message={errors.startsAt?.message} />
                </div>
                <div>
                  <Label htmlFor="campaign-expires">สิ้นสุด</Label>
                  <Controller
                    name="expiresAt"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        id="campaign-expires"
                        mode="datetime"
                        placeholder="เลือกวันและเวลาสิ้นสุด"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        aria-invalid={!!errors.expiresAt}
                        aria-describedby={errors.expiresAt ? 'campaign-expires-error' : undefined}
                        className="mt-1.5"
                      />
                    )}
                  />
                  <FieldError id="campaign-expires-error" message={errors.expiresAt?.message} />
                </div>
              </div>
            </FormSection>

            {submitError ? (
              <div
                className="flex items-start gap-3 bg-danger-bg/60 px-5 py-3.5 text-danger md:px-6"
                role="alert"
              >
                <HiOutlineExclamationCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            ) : null}

            <div className={cn('flex flex-wrap items-center justify-end gap-3 px-5 py-4 md:px-6')}>
              <Button type="button" variant="outline" asChild disabled={isPending}>
                <Link href={listHref}>ยกเลิก</Link>
              </Button>
              <Button type="submit" disabled={isPending} aria-busy={isPending}>
                {isPending ? 'กำลังบันทึก...' : isEdit ? 'บันทึก' : 'สร้างแคมเปญ'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
