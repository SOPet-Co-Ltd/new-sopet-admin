'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { PromotionCreateForm } from '@/components/promotions/promotion-create-form';
import { useCreatePromotion } from '@/hooks/usePromotions';
import {
  getPromotionTypeMeta,
  isAdminCreatablePromotionType,
  isPromotionType,
} from '@/lib/promotions/metadata';

export default function AdminPromotionCreatePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: rawType } = use(params);
  const createMutation = useCreatePromotion();

  if (!isPromotionType(rawType) || !isAdminCreatablePromotionType(rawType)) {
    notFound();
  }
  const type = rawType;

  const meta = getPromotionTypeMeta(type);
  if (!meta) notFound();

  return (
    <PromotionCreateForm
      type={type}
      title={`สร้าง${meta.label}`}
      backHref="/admin/promotions/new"
      listHref="/admin/promotions"
      isPending={createMutation.isPending}
      onSubmit={async (input) => {
        await createMutation.mutateAsync(input);
      }}
    />
  );
}
