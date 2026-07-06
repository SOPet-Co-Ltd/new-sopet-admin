'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { PromotionCreateForm } from '@/components/promotions/promotion-create-form';
import { useCreatePromotion } from '@/hooks/usePromotions';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { getPromotionTypeMeta, isPromotionType } from '@/lib/promotions/metadata';

export default function VendorPromotionCreatePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: rawType } = use(params);
  const storeId = useVendorStoreId();
  const createMutation = useCreatePromotion();

  if (!isPromotionType(rawType)) {
    notFound();
  }
  const type = rawType;

  const meta = getPromotionTypeMeta(type);
  if (!meta) notFound();

  if (!storeId) {
    return (
      <p className="text-sm text-muted">กรุณาเลือกร้านค้าจากหน้าร้านค้าของฉันก่อนสร้างโปรโมชัน</p>
    );
  }

  return (
    <PromotionCreateForm
      type={type}
      title={`สร้าง${meta.label}`}
      backHref="/vendor/promotions/new"
      listHref="/vendor/promotions"
      isPending={createMutation.isPending}
      onSubmit={async (input) => {
        await createMutation.mutateAsync({
          ...input,
          scope: 'store',
          storeId,
        });
      }}
    />
  );
}
