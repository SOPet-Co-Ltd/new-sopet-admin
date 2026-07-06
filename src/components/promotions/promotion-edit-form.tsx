'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HiArrowLeft } from 'react-icons/hi2';
import { PromotionFormFields } from '@/components/promotions/promotion-form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { labelPromotionType } from '@/lib/i18n/th';
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

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: getPromotionFormDefaults(type),
  });

  useEffect(() => {
    form.reset(getPromotionFormValuesFromPromotion(promotion));
  }, [form, promotion]);

  async function handleSubmit(values: PromotionFormValues) {
    const conditions = buildPromotionConditions(values);
    await onSubmit({
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      type: values.type,
      discountValue: values.discountValue,
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
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการโปรโมชัน
          </Link>
        }
      />

      <Card>
        <CardBody>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted">ประเภท:</span>
            <Badge status="draft">{labelPromotionType(type)}</Badge>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('type')} />

            <PromotionFormFields
              register={form.register}
              control={form.control}
              errors={errors}
              meta={meta}
              idPrefix="promo-edit"
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild>
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
