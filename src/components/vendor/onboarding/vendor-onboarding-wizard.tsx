'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/card';
import { OnboardingPhaseRail } from '@/components/vendor/onboarding/onboarding-phase-rail';
import { OnboardingStageHeader } from '@/components/vendor/onboarding/onboarding-stage-header';
import {
  OnboardingChooseStep,
  OnboardingCreateRequestStep,
  OnboardingDoneStep,
  OnboardingFirstProductStep,
  OnboardingJoinAcceptStep,
  OnboardingJoinDoneStep,
  OnboardingPayoutStep,
  OnboardingShippingStep,
  OnboardingStoreProfileStep,
  OnboardingVerifyStep,
  OnboardingWaitingStep,
} from '@/components/vendor/onboarding/onboarding-steps';
import { useCurrentUser } from '@/hooks/useAuth';
import { useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useMyStores } from '@/hooks/useMyStores';
import { useMyStoreShippingOptions } from '@/hooks/useShipping';
import { useMyStore } from '@/hooks/useStoreSettings';
import { useMyStoreRequests } from '@/hooks/useStoreRequests';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { buildStoreReadinessChecklist } from '@/lib/stores/store-readiness';
import {
  getOnboardingPhaseMeta,
  readOnboardingPersistedState,
  resolveOnboardingStep,
  writeOnboardingPersistedState,
  type OnboardingPath,
  type OnboardingStepId,
} from '@/lib/vendor/onboarding';
import { vendorHasStores } from '@/lib/vendor/vendor-store-access';

function inferOnboardingPath(input: {
  path: OnboardingPath | null;
  hasPendingStoreRequest: boolean;
  hasStores: boolean;
  isOwner: boolean;
}): OnboardingPath | null {
  if (input.path != null) return input.path;
  if (input.hasPendingStoreRequest || (input.hasStores && input.isOwner)) return 'create';
  if (input.hasStores && !input.isOwner) return 'join';
  return null;
}

export function VendorOnboardingWizard() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { isOwner } = useIsStoreOwner();
  const { data: stores = [], isLoading: storesLoading } = useMyStores();
  const { data: requests = [], isLoading: requestsLoading } = useMyStoreRequests();

  const hasStores = vendorHasStores(stores);
  const hasPendingStoreRequest = requests.some((request) => request.status === 'pending');

  const { data: store } = useMyStore();
  const { data: shippingOptions = [] } = useMyStoreShippingOptions(hasStores);
  const { data: productsResult } = useVendorProducts({ limit: 50 }, { enabled: hasStores });

  const [path, setPath] = useState<OnboardingPath | null>(
    () => readOnboardingPersistedState().path,
  );
  const [skippedSetup, setSkippedSetup] = useState(
    () => readOnboardingPersistedState().skippedSetup,
  );
  const [acknowledgedStoreProfile, setAcknowledgedStoreProfile] = useState(false);
  const [acknowledgedProduct, setAcknowledgedProduct] = useState(false);

  const effectivePath = inferOnboardingPath({
    path,
    hasPendingStoreRequest,
    hasStores,
    isOwner,
  });

  useEffect(() => {
    writeOnboardingPersistedState({ path: effectivePath, skippedSetup });
  }, [effectivePath, skippedSetup]);

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

  const stepId: OnboardingStepId = resolveOnboardingStep({
    emailVerified: user?.emailVerified === true,
    path: effectivePath,
    hasPendingStoreRequest,
    hasStores,
    isOwner,
    readiness,
    skippedSetup,
    acknowledgedStoreProfile,
    acknowledgedProduct,
  });

  const phaseMeta = getOnboardingPhaseMeta(stepId, effectivePath);

  if (storesLoading || requestsLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  return (
    <div className="min-w-0 space-y-8">
      <PageHeader
        title="เริ่มต้นตั้งค่าร้าน"
        description="ทีม SOPet จะพาคุณทีละขั้น — ยืนยันบัญชี เปิดหรือเข้าร่วมร้าน แล้วเตรียมเปิดขาย"
      />

      <OnboardingPhaseRail phases={phaseMeta.rail} />

      <OnboardingStageHeader
        phase={phaseMeta.phase}
        currentTaskLabel={phaseMeta.currentTaskLabel}
        checklist={phaseMeta.checklist}
      />

      <div className="min-w-0">
        {stepId === 'verify' && user?.email ? <OnboardingVerifyStep email={user.email} /> : null}
        {stepId === 'choose' ? <OnboardingChooseStep onSelect={setPath} /> : null}
        {stepId === 'create-request' ? <OnboardingCreateRequestStep /> : null}
        {stepId === 'waiting' ? <OnboardingWaitingStep /> : null}
        {stepId === 'join-accept' ? (
          <OnboardingJoinAcceptStep onResetPath={() => setPath(null)} />
        ) : null}
        {stepId === 'join-done' ? (
          <OnboardingJoinDoneStep onFinish={() => router.replace('/vendor')} />
        ) : null}
        {stepId === 'store-profile' ? (
          <OnboardingStoreProfileStep onContinue={() => setAcknowledgedStoreProfile(true)} />
        ) : null}
        {stepId === 'shipping' ? (
          <OnboardingShippingStep
            complete={readiness.shipping}
            onSkip={() => setSkippedSetup(true)}
          />
        ) : null}
        {stepId === 'payout' ? (
          <OnboardingPayoutStep complete={readiness.payout} onSkip={() => setSkippedSetup(true)} />
        ) : null}
        {stepId === 'first-product' ? (
          <OnboardingFirstProductStep
            complete={readiness.publishedProduct}
            onAcknowledge={() => setAcknowledgedProduct(true)}
            onSkip={() => setSkippedSetup(true)}
          />
        ) : null}
        {stepId === 'done' ? (
          <OnboardingDoneStep onFinish={() => router.replace('/vendor')} />
        ) : null}
      </div>
    </div>
  );
}
