'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { useDeletePromotion, useStorePromotions, useTogglePromotion } from '@/hooks/usePromotions';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { labelPromotionType } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';

export default function VendorPromotionsPage() {
  const storeId = useVendorStoreId();
  const { data: promotions = [], isLoading, error } = useStorePromotions(storeId);
  const deleteMutation = useDeletePromotion();
  const toggleMutation = useTogglePromotion();

  const mutationPending = deleteMutation.isPending || toggleMutation.isPending;

  return (
    <div>
      <PageHeader
        title="โปรโมชัน"
        description="จัดการโปรโมชันสำหรับร้านค้าของคุณ"
        action={
          <Button disabled={!storeId} asChild>
            <Link href="/vendor/promotions/new">สร้างโปรโมชัน</Link>
          </Button>
        }
      />

      {!storeId ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              กรุณาเลือกร้านค้าจาก{' '}
              <Link href="/vendor/stores" className="text-brand underline">
                ร้านค้าของฉัน
              </Link>{' '}
              ก่อนจัดการโปรโมชัน
            </p>
          </CardBody>
        </Card>
      ) : null}

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">{error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}</p>
      ) : null}

      <ul className="space-y-3">
        {promotions.map((promo) => (
          <li key={promo.id}>
            <Card>
              <CardBody className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{promo.name}</p>
                    <Badge status={promo.isActive ? 'published' : 'draft'}>
                      {promo.isActive ? 'เปิดใช้งาน' : 'ปิด'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {promo.code} · {labelPromotionType(promo.type)} ·{' '}
                    {promo.type === 'percentage' || promo.type === 'percentage_shipping_discount'
                      ? `${promo.discountValue}%`
                      : formatCurrency(promo.discountValue)}
                  </p>
                  <p className="text-xs text-muted">
                    ใช้แล้ว {promo.usageCount}
                    {promo.usageLimit ? ` / ${promo.usageLimit}` : ''} ครั้ง
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={mutationPending}
                    aria-busy={mutationPending}
                    onClick={() =>
                      toggleMutation.mutate({ id: promo.id, isActive: !promo.isActive })
                    }
                  >
                    {promo.isActive ? 'ปิด' : 'เปิด'}
                  </Button>
                  <Button size="sm" variant="outline" disabled={mutationPending} asChild>
                    <Link href={`/vendor/promotions/${promo.id}/edit`}>แก้ไข</Link>
                  </Button>
                  <ConfirmDeleteButton
                    confirmLabel={promo.name}
                    title="ลบโปรโมชัน"
                    variant="destructive"
                    disabled={mutationPending}
                    isDeleting={deleteMutation.isPending}
                    onConfirm={async () => {
                      await deleteMutation.mutateAsync(promo.id);
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      {!isLoading && promotions.length === 0 && storeId ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">ยังไม่มีโปรโมชัน</p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
