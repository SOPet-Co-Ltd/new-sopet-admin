'use client';

import { useParams } from 'next/navigation';
import { PromotionEditForm } from '@/components/promotions/promotion-edit-form';
import { usePlatformPromotion, useUpdatePromotion } from '@/hooks/usePromotions';
import { getErrorMessage } from '@/lib/api/errors';

export default function AdminPromotionEditPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { data: promotion, isLoading, error, isNotFound } = usePlatformPromotion(id);
  const updateMutation = useUpdatePromotion();

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดโปรโมชัน...</p>;
  }

  if (error || isNotFound || !promotion) {
    return <p className="text-sm text-danger">{getErrorMessage(error, 'ไม่พบโปรโมชัน')}</p>;
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
