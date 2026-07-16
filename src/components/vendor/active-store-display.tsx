'use client';

import Link from 'next/link';
import { useMyStores } from '@/hooks/useMyStores';
import { useSwitchStore } from '@/hooks/useSwitchStore';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { useVendorStoreSync } from '@/hooks/useVendorStoreSync';
import { labelMembershipRole, labelStoreStatus } from '@/lib/i18n/th';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ActiveStoreDisplay() {
  useVendorStoreSync();
  const storeId = useVendorStoreId();
  const { data: stores = [], isLoading } = useMyStores();
  const switchStore = useSwitchStore();

  if (isLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="กำลังโหลดร้านค้า">
        <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        <div className="h-3 w-20 animate-pulse rounded bg-surface" />
      </div>
    );
  }

  if (stores.length === 0) {
    return <p className="text-xs text-muted">ยังไม่มีร้านค้า — ส่งคำขอเปิดร้านได้ด้านล่าง</p>;
  }

  const active = stores.find((entry) => entry.store.id === storeId) ?? stores[0];
  const activeId = active.store.id;

  if (stores.length === 1) {
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

  return (
    <div className="space-y-2">
      <label htmlFor="active-store-switcher" className="text-xs font-medium text-muted">
        ร้านที่ใช้งาน
      </label>
      <Select
        value={activeId}
        onValueChange={(nextId) => {
          if (nextId !== activeId) {
            switchStore.mutate(nextId);
          }
        }}
        disabled={switchStore.isPending}
      >
        <SelectTrigger id="active-store-switcher" aria-busy={switchStore.isPending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {stores.map((entry) => (
            <SelectItem key={entry.store.id} value={entry.store.id}>
              {entry.store.name}
              {entry.store.status === 'suspended' ? ` (${labelStoreStatus('suspended')})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted">{labelMembershipRole(active.membershipRole)}</p>
      <Link href="/vendor/stores" className="text-xs font-medium text-brand hover:underline">
        จัดการร้านทั้งหมด
      </Link>
    </div>
  );
}
