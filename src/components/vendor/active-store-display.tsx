'use client';

import { useMyStores } from '@/hooks/useMyStores';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { useVendorStoreSync } from '@/hooks/useVendorStoreSync';
import { labelMembershipRole, labelStoreStatus } from '@/lib/i18n/th';

export function ActiveStoreDisplay() {
  useVendorStoreSync();
  const storeId = useVendorStoreId();
  const { data: stores = [], isLoading } = useMyStores();

  if (isLoading) {
    return <p className="text-xs text-muted">กำลังโหลดร้านค้า...</p>;
  }

  if (stores.length === 0) {
    return <p className="text-xs text-muted">ยังไม่มีร้านค้า — ส่งคำขอเปิดร้านได้ด้านล่าง</p>;
  }

  const active = stores.find((entry) => entry.store.id === storeId) ?? stores[0];

  return (
    <div>
      <p className="truncate text-sm font-medium text-ink">{active.store.name}</p>
      <p className="text-xs text-muted">{labelMembershipRole(active.membershipRole)}</p>
      {active.store.status === 'suspended' ? (
        <p className="mt-1 text-xs font-medium text-danger">{labelStoreStatus('suspended')}</p>
      ) : null}
    </div>
  );
}
