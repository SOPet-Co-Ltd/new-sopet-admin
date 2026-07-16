'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { PromotionCreateForm } from '@/components/promotions/promotion-create-form';
import { useCreatePromotion } from '@/hooks/usePromotions';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { getPromotionTypeMeta, isPromotionType } from '@/lib/promotions/metadata';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';

function PromotionCreateSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-surface motion-reduce:animate-none" />
        <div className="h-8 w-56 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-12 border-b border-border bg-surface/60" />
        <div className="space-y-6 p-5 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-16 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
            <div className="h-16 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
          </div>
          <div className="h-20 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
          <div className="h-16 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
        </div>
      </div>
      <span className="sr-only">กำลังโหลดแบบฟอร์มสร้างโปรโมชัน...</span>
    </div>
  );
}

export default function VendorPromotionCreatePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: rawType } = use(params);
  const authHydrated = useAuthStore((s) => s.hasHydrated);
  const vendorHydrated = useVendorStore((s) => s.hasHydrated);
  const storeId = useVendorStoreId();
  const createMutation = useCreatePromotion();

  if (!isPromotionType(rawType)) {
    notFound();
  }
  const type = rawType;

  const meta = getPromotionTypeMeta(type);
  if (!meta) notFound();

  if (!authHydrated || !vendorHydrated) {
    return <PromotionCreateSkeleton />;
  }

  if (!storeId) {
    return (
      <div
        className="mx-auto max-w-2xl rounded-xl border border-border bg-card px-5 py-8 text-center md:px-6"
        role="status"
      >
        <p className="text-sm font-medium text-ink">ยังไม่ได้เลือกร้านค้า</p>
        <p className="mt-1.5 text-pretty text-sm text-muted-foreground">
          กรุณาเลือกร้านค้าจากหน้าร้านค้าของฉันก่อนสร้างโปรโมชัน
        </p>
      </div>
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
