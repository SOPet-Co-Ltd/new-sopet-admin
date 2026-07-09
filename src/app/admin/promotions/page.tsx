'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import {
  useDeletePromotion,
  usePlatformPromotions,
  useTogglePromotion,
} from '@/hooks/usePromotions';
import { labelPromotionType } from '@/lib/i18n/th';
import { formatCurrency } from '@/lib/utils';

export default function AdminPromotionsPage() {
  const { data: promotions = [], isLoading, error } = usePlatformPromotions();
  const deleteMutation = useDeletePromotion();
  const toggleMutation = useTogglePromotion();

  const mutationPending = deleteMutation.isPending || toggleMutation.isPending;

  return (
    <div>
      <PageHeader
        title="โปรโมชันแพลตฟอร์ม"
        description="จัดการโปรโมชันระดับแพลตฟอร์ม"
        action={
          <Button asChild>
            <Link href="/admin/promotions/new">สร้างโปรโมชัน</Link>
          </Button>
        }
      />

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
                    <Link href={`/admin/promotions/${promo.id}/edit`}>แก้ไข</Link>
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

      {!isLoading && promotions.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">ยังไม่มีโปรโมชัน</p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
