'use client';

import { Suspense, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { HiArrowLeft, HiOutlineExclamationCircle } from 'react-icons/hi2';
import { PromotionFormFields } from '@/components/promotions/promotion-form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { ActionGuideSpotlight } from '@/components/vendor/product-tour/action-guide-spotlight';
import {
  ACTION_GUIDE_CHANGE_EVENT,
  advanceActionGuide,
  isActionGuideActive,
  readActionGuideState,
} from '@/lib/vendor/action-guide';
import { useBootstrapActionGuide } from '@/lib/vendor/use-bootstrap-action-guide';
import {
  buildPromotionConditions,
  getPromotionFormDefaults,
  promotionFormSchema,
  type PromotionFormValues,
} from '@/lib/validations/promotions';
import { getPromotionTypeMeta, type PromotionTypeSlug } from '@/lib/promotions/metadata';
import type { CreatePromotionInput } from '@/types';
import { getErrorMessage } from '@/lib/api/errors';

function CreatePromotionGuideBootstrap() {
  const searchParams = useSearchParams();
  useBootstrapActionGuide('create-promotion');

  useEffect(() => {
    function ensureFormStep() {
      // Type picker is step 1; on the create form, surface basics (step 2+).
      if (isActionGuideActive('create-promotion') && readActionGuideState().step === 1) {
        advanceActionGuide();
      }
    }
    ensureFormStep();
    window.addEventListener(ACTION_GUIDE_CHANGE_EVENT, ensureFormStep);
    return () => window.removeEventListener(ACTION_GUIDE_CHANGE_EVENT, ensureFormStep);
  }, [searchParams]);

  return <ActionGuideSpotlight guideId="create-promotion" />;
}

export function PromotionCreateForm({
  type,
  backHref,
  listHref,
  title,
  isPending,
  onSubmit,
  scope: scopeProp,
}: {
  type: PromotionTypeSlug;
  backHref: string;
  listHref: string;
  title: string;
  isPending: boolean;
  onSubmit: (input: CreatePromotionInput) => Promise<void>;
  scope?: 'platform' | 'store';
}) {
  const router = useRouter();
  const meta = getPromotionTypeMeta(type)!;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scope = scopeProp ?? (listHref.startsWith('/vendor') ? 'store' : 'platform');

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: getPromotionFormDefaults(type),
  });

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
        // Send an explicit value (even "no conditions") for symmetry with the
        // edit form - see promotion-edit-form.tsx for why omitting this field
        // is unsafe once the promotion can be edited later.
        conditions: conditions ?? '{}',
      });
      router.push(listHref);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'สร้างโปรโมชันไม่สำเร็จ กรุณาลองอีกครั้ง'));
    }
  }

  const { errors } = form.formState;

  return (
    <div className="mx-auto max-w-2xl">
      <Suspense fallback={null}>
        <CreatePromotionGuideBootstrap />
      </Suspense>
      <PageHeader
        title={title}
        description={meta.description}
        back={
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-brand motion-reduce:transition-none"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            เปลี่ยนประเภท
          </Link>
        }
      />

      <Card>
        <CardBody className="p-0">
          <div className="flex flex-wrap items-center gap-2 rounded-t-xl border-b border-border bg-surface/60 px-5 py-3.5 md:px-6">
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
              scope={scope}
              setValue={form.setValue}
              getValues={form.getValues}
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
              <Button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                data-tour-id="action-promo-submit"
              >
                {isPending ? 'กำลังบันทึก...' : 'สร้างโปรโมชัน'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
