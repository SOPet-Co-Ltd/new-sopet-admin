'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { StoreRequestSection } from '@/components/vendor/store-request-section';
import { TaxonomyProposalsSection } from '@/components/vendor/taxonomy-proposals-section';
import { useMyStores } from '@/hooks/useMyStores';
import { useSwitchStore } from '@/hooks/useSwitchStore';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { labelMembershipRole, labelStoreStatus } from '@/lib/i18n/th';
import { getErrorMessage } from '@/lib/api/errors';
import type { VendorStore } from '@/types';

function StoreCard({
  entry,
  isActive,
  onSelect,
  isPending,
}: {
  entry: VendorStore;
  isActive: boolean;
  onSelect: () => void;
  isPending: boolean;
}) {
  const { store, membershipRole } = entry;
  const isSuspended = store.status === 'suspended';
  const canManage = membershipRole === 'owner' || membershipRole === 'manager';

  return (
    <Card className={isActive ? 'ring-2 ring-brand/30' : undefined}>
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-ink">{store.name}</p>
            <Badge>{labelMembershipRole(membershipRole)}</Badge>
            {isSuspended ? (
              <Badge className="bg-danger/10 text-danger">{labelStoreStatus('suspended')}</Badge>
            ) : null}
            {isActive && !isSuspended ? (
              <span className="text-xs font-medium text-brand">ใช้งานอยู่</span>
            ) : null}
          </div>
          <p className="text-sm text-muted">{store.slug}</p>
          {isSuspended ? (
            <p className="mt-1 text-xs text-danger">
              {canManage
                ? 'ร้านนี้ถูกระงับ — ส่งคำขอเปิดใช้งานเพื่อให้ทีมงานตรวจสอบ'
                : 'ร้านนี้ถูกระงับ — ติดต่อเจ้าของร้านหรือผู้จัดการเพื่อส่งคำขอเปิดใช้งาน'}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isSuspended && canManage ? (
            <Button type="button" size="sm" variant="outline" asChild>
              <Link href={`/vendor/reactivation?storeId=${store.id}`}>ส่งคำขอเปิดใช้งาน</Link>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={isPending || isSuspended}
            aria-busy={isPending}
            onClick={onSelect}
          >
            {isSuspended ? 'ถูกระงับ' : isActive ? 'เข้าจัดการร้าน' : 'เลือกร้านนี้'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function StoreGroup({
  title,
  description,
  stores,
  activeStoreId,
  onSelect,
  isPending,
}: {
  title: string;
  description: string;
  stores: VendorStore[];
  activeStoreId?: string;
  onSelect: (storeId: string) => void;
  isPending: boolean;
}) {
  if (stores.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <ul className="space-y-3">
        {stores.map((entry) => (
          <li key={entry.store.id}>
            <StoreCard
              entry={entry}
              isActive={entry.store.id === activeStoreId}
              isPending={isPending}
              onSelect={() => onSelect(entry.store.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function VendorStoresPage() {
  const router = useRouter();
  const activeStoreId = useVendorStoreId();
  const { data: myStores = [], isLoading, error } = useMyStores();
  const switchMutation = useSwitchStore();

  const ownedStores = myStores.filter((entry) => entry.membershipRole === 'owner');
  const joinedStores = myStores.filter((entry) => entry.membershipRole !== 'owner');

  function handleSelectStore(storeId: string) {
    const entry = myStores.find((item) => item.store.id === storeId);
    if (entry?.store.status === 'suspended') return;

    if (storeId === activeStoreId) {
      router.push('/vendor');
      return;
    }
    switchMutation.mutate(storeId, {
      onSuccess: () => router.push('/vendor'),
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="ร้านค้าของฉัน"
        description="เลือกร้านค้าเพื่อจัดการ หรือส่งคำขอเปิดร้านใหม่"
      />

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">
          {error instanceof Error ? error.message : 'โหลดร้านค้าไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading && myStores.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              คุณยังไม่มีร้านค้า — ส่งคำขอเปิดร้านด้านล่างเพื่อเริ่มต้น
            </p>
          </CardBody>
        </Card>
      ) : null}

      <StoreGroup
        title="ร้านที่เป็นเจ้าของ"
        description="ร้านค้าที่คุณเป็นเจ้าของและมีสิทธิ์จัดการเต็มรูปแบบ"
        stores={ownedStores}
        activeStoreId={activeStoreId}
        onSelect={handleSelectStore}
        isPending={switchMutation.isPending}
      />

      <StoreGroup
        title="ร้านที่เข้าร่วม"
        description="ร้านค้าที่คุณเป็นสมาชิกทีม (ผู้จัดการหรือพนักงาน)"
        stores={joinedStores}
        activeStoreId={activeStoreId}
        onSelect={handleSelectStore}
        isPending={switchMutation.isPending}
      />

      {switchMutation.error ? (
        <p className="text-sm text-danger">{getErrorMessage(switchMutation.error)}</p>
      ) : null}

      <StoreRequestSection />

      <TaxonomyProposalsSection />
    </div>
  );
}
