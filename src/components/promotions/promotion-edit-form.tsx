'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { HiArrowLeft, HiOutlineExclamationCircle } from 'react-icons/hi2';
import { PromotionFormFields } from '@/components/promotions/promotion-form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { getPromotionTypeMeta, type PromotionTypeSlug } from '@/lib/promotions/metadata';
import {
  buildPromotionConditions,
  getPromotionFormDefaults,
  getPromotionFormValuesFromPromotion,
  promotionFormSchema,
  type PromotionFormValues,
} from '@/lib/validations/promotions';
import type { CreatePromotionInput, Promotion } from '@/types';

export function PromotionEditForm({
  promotion,
  listHref,
  isPending,
  onSubmit,
}: {
  promotion: Promotion;
  listHref: string;
  isPending: boolean;
  onSubmit: (input: CreatePromotionInput) => Promise<void>;
}) {
  const router = useRouter();
  const type = promotion.type as PromotionTypeSlug;
  const meta = getPromotionTypeMeta(type)!;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: getPromotionFormDefaults(type),
  });

  useEffect(() => {
    form.reset(getPromotionFormValuesFromPromotion(promotion));
  }, [form, promotion]);

  async function handleSubmit(values: PromotionFormValues) {
    setSubmitError(null);
    const conditions = buildPromotionConditions(values);
    try {
      await onSubmit({
        code: values.code,
        name: values.name,
        description: values.description || undefined,
        type: values.type,
        discountValue: values.discountValue ?? 0,
        minPurchaseAmount: values.minPurchaseAmount,
        maxDiscountAmount: meta.showMaxDiscount ? values.maxDiscountAmount : undefined,
        usageLimit: values.usageLimit,
        usagePerCustomer: values.usagePerCustomer,
        autoApply: values.autoApply,
        priority: values.priority,
        startsAt: values.startsAt || undefined,
        expiresAt: values.expiresAt || undefined,
        ...(conditions ? { conditions } : {}),
      });
      router.push(listHref);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'บันทึกโปรโมชันไม่สำเร็จ กรุณาลองอีกครั้ง',
      );
    }
  }

  const { errors } = form.formState;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="แก้ไขโปรโมชัน"
        description={meta.description}
        back={
          <Link
            href={listHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-brand motion-reduce:transition-none"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการโปรโมชัน
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface/60 px-5 py-3.5 md:px-6">
            <span className="text-sm text-muted-foreground">ประเภท</span>
            <Badge status="draft">{meta.label}</Badge>
          </div>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="divide-y divide-border"
            noValidate
            aria-busy={isPending}
          >
            <input type="hidden" {...form.register('type')} />

            <PromotionFormFields
              register={form.register}
              control={form.control}
              errors={errors}
              meta={meta}
              idPrefix="promo-edit"
            />

            {submitError ? (
              <div
                className="flex items-start gap-3 bg-danger-bg/60 px-5 py-3.5 text-danger md:px-6"
                role="alert"
              >
                <HiOutlineExclamationCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4 md:px-6">
              <Button type="button" variant="outline" asChild disabled={isPending}>
                <Link href={listHref}>ยกเลิก</Link>
              </Button>
              <Button type="submit" disabled={isPending} aria-busy={isPending}>
                {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
