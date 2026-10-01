'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HiArrowRight, HiRocketLaunch } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useMyStores } from '@/hooks/useMyStores';
import { useMyStoreShippingOptions } from '@/hooks/useShipping';
import { useMyStore } from '@/hooks/useStoreSettings';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { buildStoreReadinessChecklist } from '@/lib/stores/store-readiness';
import {
  readOnboardingPersistedState,
  shouldShowOnboardingResumeBanner,
  writeOnboardingPersistedState,
} from '@/lib/vendor/onboarding';
import { vendorHasStores } from '@/lib/vendor/vendor-store-access';

export function VendorOnboardingResumeBanner() {
  const { isOwner } = useIsStoreOwner();
  const { data: stores = [] } = useMyStores();
  const hasStores = vendorHasStores(stores);

  const { data: store } = useMyStore();
  const { data: shippingOptions = [] } = useMyStoreShippingOptions(hasStores);
  const { data: productsResult } = useVendorProducts({ limit: 50 }, { enabled: hasStores });
  const [skippedSetup, setSkippedSetup] = useState(
    () => readOnboardingPersistedState().skippedSetup,
  );

  const readinessChecklist = useMemo(
    () =>
      buildStoreReadinessChecklist({
        shippingOptions,
        products: productsResult?.items ?? [],
        omiseRecipientStatus: store?.omiseRecipientStatus,
      }),
    [shippingOptions, productsResult?.items, store?.omiseRecipientStatus],
  );

  const readiness = useMemo(
    () => ({
      shipping: readinessChecklist.items.find((item) => item.key === 'shipping')?.complete ?? false,
      publishedProduct:
        readinessChecklist.items.find((item) => item.key === 'publishedProduct')?.complete ?? false,
      payout: readinessChecklist.items.find((item) => item.key === 'payout')?.complete ?? false,
    }),
    [readinessChecklist],
  );

  const visible = shouldShowOnboardingResumeBanner({
    hasStores,
    isOwner,
    skippedSetup,
    readiness,
  });

  if (!visible) return null;

  function dismiss() {
    const current = readOnboardingPersistedState();
    writeOnboardingPersistedState({ ...current, skippedSetup: true });
    setSkippedSetup(true);
  }

  return (
    <Card className="border-brand-soft bg-brand-tint/40">
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <HiRocketLaunch className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="font-medium text-ink">ยังตั้งค่าร้านไม่ครบ</p>
            <p className="mt-0.5 text-sm text-muted">
              ทำต่อคู่มือเปิดร้านเพื่อตั้งการจัดส่ง รับเงิน และสินค้าแรกในที่เดียว
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" asChild>
            <Link href="/vendor/onboarding">
              ทำต่อ
              <HiArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={dismiss}>
            ปิด
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
