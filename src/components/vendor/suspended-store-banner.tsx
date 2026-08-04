'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useMyStores } from '@/hooks/useMyStores';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

export function SuspendedStoreBanner() {
  const storeId = useVendorStoreId();
  const pathname = usePathname();
  const { data: stores = [] } = useMyStores();

  const suspendedStore = useMemo(() => {
    if (!storeId) return undefined;
    const entry = stores.find((item) => item.store.id === storeId);
    if (entry?.store.status === 'suspended') return entry;
    return undefined;
  }, [storeId, stores]);

  if (!suspendedStore) return null;

  const canManage =
    suspendedStore.membershipRole === 'owner' || suspendedStore.membershipRole === 'manager';
  // Vendor is already on the reactivation page - its own submit button is the real
  // CTA. Showing this banner's link there too duplicates it with a dead no-op click
  // (navigating to the URL you're already on), which reads as a broken button (row 43).
  const onReactivationPage = pathname?.startsWith('/vendor/reactivation') ?? false;

  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-ink"
    >
      <p className="font-medium text-danger">
        ร้าน &quot;{suspendedStore.store.name}&quot; ถูกระงับชั่วคราว
      </p>
      <p className="mt-1 text-muted">
        คุณไม่สามารถจัดการร้านนี้ได้จนกว่าทีมงานจะเปิดใช้งานอีกครั้ง
        {canManage
          ? ' กรุณาส่งคำขอเปิดใช้งานพร้อมเหตุผลและหลักฐานประกอบ'
          : ' กรุณาติดต่อเจ้าของร้านหรือผู้จัดการเพื่อส่งคำขอเปิดใช้งาน'}
      </p>
      {canManage && !onReactivationPage ? (
        <Button type="button" size="sm" className="mt-3" asChild>
          <Link href={`/vendor/reactivation?storeId=${suspendedStore.store.id}`}>
            ส่งคำขอเปิดใช้งานร้าน
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
