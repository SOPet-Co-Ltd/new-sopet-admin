'use client';

import Link from 'next/link';
import { use } from 'react';
import { PromotionEditForm } from '@/components/promotions/promotion-edit-form';
import { Card, CardBody } from '@/components/ui/card';
import { useStorePromotion, useUpdatePromotion } from '@/hooks/usePromotions';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

export default function VendorPromotionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const storeId = useVendorStoreId();
  const { data: promotion, isLoading, error, isNotFound } = useStorePromotion(id, storeId);
  const updateMutation = useUpdatePromotion();

  if (!storeId) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-muted">
            กรุณาเลือกร้านค้าจาก{' '}
            <Link href="/vendor/stores" className="text-brand underline">
              ร้านค้าของฉัน
            </Link>{' '}
            ก่อนแก้ไขโปรโมชัน
          </p>
        </CardBody>
      </Card>
    );
  }

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
      listHref="/vendor/promotions"
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
