'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { StoreReactivationSection } from '@/components/vendor/store-reactivation-section';
import { useMyStores } from '@/hooks/useMyStores';

export default function VendorReactivationPage() {
  const searchParams = useSearchParams();
  const requestedStoreId = searchParams.get('storeId') ?? undefined;
  const { data: myStores = [], isLoading, error } = useMyStores();

  const manageableSuspendedStores = useMemo(
    () =>
      myStores.filter(
        (entry) =>
          entry.store.status === 'suspended' &&
          (entry.membershipRole === 'owner' || entry.membershipRole === 'manager'),
      ),
    [myStores],
  );

  const selectedStore = useMemo(() => {
    if (requestedStoreId) {
      return manageableSuspendedStores.find((entry) => entry.store.id === requestedStoreId);
    }
    return manageableSuspendedStores[0];
  }, [manageableSuspendedStores, requestedStoreId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="คำขอเปิดใช้งานร้าน"
        description="ส่งคำขอและติดตามสถานะเมื่อร้านถูกระงับชั่วคราว"
      />

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">
          {error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ'}
        </p>
      ) : null}

      {!isLoading && manageableSuspendedStores.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              ไม่มีร้านที่ถูกระงับซึ่งคุณมีสิทธิ์ส่งคำขอเปิดใช้งาน
            </p>
          </CardBody>
        </Card>
      ) : null}

      {selectedStore ? (
        <StoreReactivationSection
          storeId={selectedStore.store.id}
          storeName={selectedStore.store.name}
        />
      ) : null}

      {manageableSuspendedStores.length > 1 ? (
        <Card>
          <CardBody className="space-y-2">
            <p className="text-sm font-medium text-ink">ร้านที่ถูกระงับทั้งหมด</p>
            <ul className="space-y-1 text-sm text-muted">
              {manageableSuspendedStores.map((entry) => (
                <li key={entry.store.id}>
                  <a
                    href={`/vendor/reactivation?storeId=${entry.store.id}`}
                    className="text-brand hover:underline"
                  >
                    {entry.store.name}
                  </a>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
