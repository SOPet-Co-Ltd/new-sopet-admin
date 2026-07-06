'use client';

import { use } from 'react';
import { PromotionEditForm } from '@/components/promotions/promotion-edit-form';
import { usePlatformPromotion, useUpdatePromotion } from '@/hooks/usePromotions';

export default function AdminPromotionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: promotion, isLoading, error, isNotFound } = usePlatformPromotion(id);
  const updateMutation = useUpdatePromotion();

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดโปรโมชัน...</p>;
  }

  if (error || isNotFound || !promotion) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : 'ไม่พบโปรโมชัน'}
      </p>
    );
  }

  return (
    <PromotionEditForm
      promotion={promotion}
      listHref="/admin/promotions"
      isPending={updateMutation.isPending}
      onSubmit={async (input) => {
        await updateMutation.mutateAsync({
          id: promotion.id,
          input: {
            ...input,
            startsAt: input.startsAt || undefined,
            expiresAt: input.expiresAt || undefined,
          },
        });
      }}
    />
  );
}
