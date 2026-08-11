'use client';

import { notFound, useParams } from 'next/navigation';
import { PromotionCreateForm } from '@/components/promotions/promotion-create-form';
import { useCreatePromotion } from '@/hooks/usePromotions';
import {
  getPromotionTypeMeta,
  isAdminCreatablePromotionType,
  isPromotionType,
} from '@/lib/promotions/metadata';

export default function AdminPromotionCreatePage() {
  const params = useParams<{ type: string }>();
  const rawType = typeof params.type === 'string' ? params.type : '';
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
