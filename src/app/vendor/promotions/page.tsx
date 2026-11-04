'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { VendorPromotionListItem } from '@/components/vendor/vendor-promotion-list-item';
import { VendorPromotionsEmptyState } from '@/components/vendor/vendor-promotions-empty-state';
import { VendorPromotionsListSkeleton } from '@/components/vendor/vendor-promotions-list-skeleton';
import { PageFeatureSpotlight } from '@/components/vendor/product-tour/page-feature-spotlight';
import { useCurrentUser } from '@/hooks/useAuth';
import { useDeletePromotion, useStorePromotions, useTogglePromotion } from '@/hooks/usePromotions';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { startActionGuide } from '@/lib/vendor/action-guide';
import type { Promotion } from '@/types';
import { getErrorMessage } from '@/lib/api/errors';

const STORE_PROMOTIONS_PAGE_SIZE = 20;

export default function VendorPromotionsPage() {
  const { user } = useCurrentUser();
  const storeId = useVendorStoreId();
  const [page, setPage] = useState(1);
  const [pagedStoreId, setPagedStoreId] = useState(storeId);
  if (pagedStoreId !== storeId) {
    setPagedStoreId(storeId);
    setPage(1);
  }
  const { data, isLoading, error } = useStorePromotions(storeId, {
    page: pagedStoreId === storeId ? page : 1,
    limit: STORE_PROMOTIONS_PAGE_SIZE,
  });
  const promotions = data?.items ?? [];
  const pagination = data?.pagination;
  const deleteMutation = useDeletePromotion();
  const toggleMutation = useTogglePromotion();

  function handleToggle(promo: Promotion) {
    toggleMutation.mutate({ id: promo.id, isActive: !promo.isActive });
  }

  async function handleDelete(promo: Promotion) {
    await deleteMutation.mutateAsync(promo.id);
  }

  return (
    <div className="space-y-6">
      <PageFeatureSpotlight
        featureId="promotions-empty-add"
        eligible={Boolean(storeId) && !isLoading && !error && promotions.length === 0}
        onCompleted={() => {
          startActionGuide('create-promotion', { userId: user?.id });
        }}
      />
      <PageHeader
        title="โปรโมชัน"
        description="จัดการโค้ดส่วนลดและโปรโมชันของร้าน"
        action={
          storeId ? (
            <Button asChild>
              <Link href="/vendor/promotions/new" data-tour-id="promotions-add-cta">
                สร้างโปรโมชัน
              </Link>
            </Button>
          ) : undefined
        }
      />

      {!storeId ? (
        <Card className="border-dashed">
          <CardBody className="flex flex-col items-start gap-3 px-6 py-10 sm:items-center sm:text-center">
            <div className="max-w-md space-y-1.5">
              <h2 className="text-balance text-base font-medium text-ink">ยังไม่ได้เลือกร้านค้า</h2>
              <p className="text-pretty text-sm text-muted-foreground">
                เลือกร้านจากร้านค้าของฉันก่อน จึงจะดูและจัดการโปรโมชันได้
              </p>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/vendor/stores">ไปที่ร้านค้าของฉัน</Link>
            </Button>
          </CardBody>
        </Card>
      ) : null}

      {storeId && isLoading ? <VendorPromotionsListSkeleton /> : null}

      {storeId && error ? (
        <p className="text-sm text-danger" role="alert">
          {getErrorMessage(error, 'โหลดโปรโมชันไม่สำเร็จ')}
        </p>
      ) : null}

      {storeId && toggleMutation.error ? (
        <p className="text-sm text-danger" role="alert">
          {getErrorMessage(toggleMutation.error, 'เปลี่ยนสถานะโปรโมชันไม่สำเร็จ')}
        </p>
      ) : null}

      {storeId && deleteMutation.error ? (
        <p className="text-sm text-danger" role="alert">
          {getErrorMessage(deleteMutation.error, 'ลบโปรโมชันไม่สำเร็จ')}
        </p>
      ) : null}

      {storeId && !isLoading && !error && promotions.length === 0 ? (
        <VendorPromotionsEmptyState />
      ) : null}

      {storeId && !isLoading && !error && promotions.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
          {promotions.map((promo) => {
            const isToggling =
              toggleMutation.isPending && toggleMutation.variables?.id === promo.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === promo.id;

            return (
              <VendorPromotionListItem
                key={promo.id}
                promo={promo}
                isToggling={isToggling}
                isDeleting={isDeleting}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            );
          })}
        </ul>
      ) : null}

      {storeId && pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="tabular-nums">
            หน้า {pagination.page} จาก {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              ก่อนหน้า
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
