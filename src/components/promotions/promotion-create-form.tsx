'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PromotionFormFields } from '@/components/promotions/promotion-form-fields';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import {
  buildPromotionConditions,
  getPromotionFormDefaults,
  promotionFormSchema,
  type PromotionFormValues,
} from '@/lib/validations/promotions';
import { getPromotionTypeMeta, type PromotionTypeSlug } from '@/lib/promotions/metadata';
import type { CreatePromotionInput } from '@/types';

export function PromotionCreateForm({
  type,
  backHref,
  listHref,
  title,
  isPending,
  onSubmit,
}: {
  type: PromotionTypeSlug;
  backHref: string;
  listHref: string;
  title: string;
  isPending: boolean;
  onSubmit: (input: CreatePromotionInput) => Promise<void>;
}) {
  const router = useRouter();
  const meta = getPromotionTypeMeta(type)!;

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: getPromotionFormDefaults(type),
  });

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
        title={title}
        description={meta.description}
        action={
          <Button variant="outline" asChild>
            <Link href={backHref}>เปลี่ยนประเภท</Link>
          </Button>
        }
      />

      <Card>
        <CardBody>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('type')} />

            <PromotionFormFields
              register={form.register}
              control={form.control}
              errors={errors}
              meta={meta}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href={listHref}>ยกเลิก</Link>
              </Button>
              <Button type="submit" disabled={isPending} aria-busy={isPending}>
                {isPending ? 'กำลังบันทึก...' : 'สร้างโปรโมชัน'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
