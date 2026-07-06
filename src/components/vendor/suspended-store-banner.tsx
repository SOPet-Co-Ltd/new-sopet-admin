'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useMyStores } from '@/hooks/useMyStores';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

export function SuspendedStoreBanner() {
  const storeId = useVendorStoreId();
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
      {canManage ? (
        <Button type="button" size="sm" className="mt-3" asChild>
          <Link href={`/vendor/reactivation?storeId=${suspendedStore.store.id}`}>
            ส่งคำขอเปิดใช้งานร้าน
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
