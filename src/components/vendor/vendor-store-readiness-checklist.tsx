'use client';

import Link from 'next/link';
import { HiArrowRight, HiCheck, HiClipboardDocumentCheck, HiXMark } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useMyStore } from '@/hooks/useStoreSettings';
import { useMyStoreShippingOptions } from '@/hooks/useShipping';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import {
  STORE_READINESS_ACTIONS,
  STORE_READINESS_LABELS,
  buildStoreReadinessChecklist,
  type StoreReadinessItemKey,
} from '@/lib/stores/store-readiness';
import { cn } from '@/lib/utils';

export function VendorStoreReadinessChecklist() {
  const { isOwner } = useIsStoreOwner();
  const { data: store, isLoading: storeLoading } = useMyStore();
  const { data: shippingOptions = [], isLoading: shippingLoading } = useMyStoreShippingOptions();
  const { data: productsResult, isLoading: productsLoading } = useVendorProducts({ limit: 50 });

  const isLoading = storeLoading || shippingLoading || productsLoading;
  const checklist = buildStoreReadinessChecklist({
    shippingOptions,
    products: productsResult?.items ?? [],
    omiseRecipientStatus: store?.omiseRecipientStatus,
  });

  const ownerOnlyKeys = new Set<StoreReadinessItemKey>(['payout']);
  const visibleItems = checklist.items.filter((item) => isOwner || !ownerOnlyKeys.has(item.key));

  const completedCount = visibleItems.filter((item) => item.complete).length;
  const allComplete = visibleItems.length > 0 && completedCount === visibleItems.length;

  if (!isLoading && allComplete) {
    return null;
  }

  return (
    <section aria-labelledby="vendor-store-readiness-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="vendor-store-readiness-heading" className="text-lg font-medium text-ink">
            เช็คลิสต์เปิดร้าน
          </h2>
          <p className="text-sm text-muted">
            สิ่งที่ควรทำให้ครบเพื่อให้ร้านขายและรับออเดอร์ได้ลื่น
          </p>
        </div>
        {!isLoading ? (
          <p className="text-sm text-muted">
            ครบแล้ว {completedCount}/{visibleItems.length} รายการ
          </p>
        ) : null}
      </div>

      <Card>
        <CardBody className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังตรวจสอบความพร้อมของร้าน...</p>
          ) : (
            <ul className="space-y-3">
              {visibleItems.map((item) => (
                <li
                  key={item.key}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    {item.complete ? (
                      <HiCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    ) : (
                      <HiXMark className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                    )}
                    <span className={cn('text-sm', item.complete ? 'text-ink' : 'text-muted')}>
                      {STORE_READINESS_LABELS[item.key]}
                    </span>
                  </div>
                  {!item.complete ? (
                    <Button size="sm" variant="outline" asChild className="shrink-0">
                      <Link href={item.href}>
                        {STORE_READINESS_ACTIONS[item.key]}
                        <HiArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !allComplete ? (
            <div className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-surface/60 px-3 py-2.5 text-xs text-muted">
              <HiClipboardDocumentCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>เมื่อครบทุกรายการ ลูกค้าจะสั่งซื้อและร้านจะรับเงินได้ตามปกติ</p>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </section>
  );
}
