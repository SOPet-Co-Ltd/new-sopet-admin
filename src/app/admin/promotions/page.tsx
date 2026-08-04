'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import { PlatformPromotionListItem } from '@/components/admin/platform-promotion-list-item';
import { PlatformPromotionsEmptyState } from '@/components/admin/platform-promotions-empty-state';
import { PlatformPromotionsListSkeleton } from '@/components/admin/platform-promotions-list-skeleton';
import {
  useDeletePromotion,
  usePlatformPromotions,
  useTogglePromotion,
} from '@/hooks/usePromotions';
import type { Promotion } from '@/types';

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminPromotionsPage() {
  const { data: promotions = [], isLoading, error } = usePlatformPromotions();
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
      <PageHeader
        title="โปรโมชันแพลตฟอร์ม"
        description="จัดการโค้ดส่วนลดและโปรโมชันระดับแพลตฟอร์มที่ใช้ได้ทั้งตลาด"
        action={
          <Button asChild>
            <Link href="/admin/promotions/new">สร้างโปรโมชัน</Link>
          </Button>
        }
      />

      {isLoading ? <PlatformPromotionsListSkeleton /> : null}

      {error ? (
        <p className="text-sm text-danger" role="alert">
          {mutationErrorMessage(error, 'โหลดโปรโมชันแพลตฟอร์มไม่สำเร็จ')}
        </p>
      ) : null}

      {toggleMutation.error ? (
        <p className="text-sm text-danger" role="alert">
          {mutationErrorMessage(toggleMutation.error, 'เปลี่ยนสถานะโปรโมชันไม่สำเร็จ')}
        </p>
      ) : null}

      {deleteMutation.error ? (
        <p className="text-sm text-danger" role="alert">
          {mutationErrorMessage(deleteMutation.error, 'ลบโปรโมชันไม่สำเร็จ')}
        </p>
      ) : null}

      {!isLoading && !error && promotions.length === 0 ? <PlatformPromotionsEmptyState /> : null}

      {!isLoading && !error && promotions.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
          {promotions.map((promo) => {
            const isToggling =
              toggleMutation.isPending && toggleMutation.variables?.id === promo.id;
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === promo.id;

            return (
              <PlatformPromotionListItem
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
    </div>
  );
}
