'use client';

import { Suspense } from 'react';
import { SaleCampaignForm } from '@/components/vendor/sale-campaign-form';
import { ActionGuideSpotlight } from '@/components/vendor/product-tour/action-guide-spotlight';
import { useCreateSaleCampaign } from '@/hooks/useSaleCampaigns';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { useBootstrapActionGuide } from '@/lib/vendor/use-bootstrap-action-guide';

function CreateCampaignGuideBootstrap() {
  useBootstrapActionGuide('create-campaign');
  return <ActionGuideSpotlight guideId="create-campaign" />;
}

export default function VendorSaleCampaignCreatePage() {
  const storeId = useVendorStoreId();
  const createMutation = useCreateSaleCampaign();

  if (!storeId) {
    return (
      <div
        className="mx-auto max-w-2xl rounded-xl border border-border bg-card px-5 py-8 text-center md:px-6"
        role="status"
      >
        <p className="text-sm font-medium text-ink">ยังไม่ได้เลือกร้านค้า</p>
        <p className="mt-1.5 text-pretty text-sm text-muted-foreground">
          กรุณาเลือกร้านค้าจากหน้าร้านค้าของฉันก่อนสร้างแคมเปญ
        </p>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <CreateCampaignGuideBootstrap />
      </Suspense>
      <SaleCampaignForm
        title="สร้างแคมเปญ"
        backHref="/vendor/campaigns"
        listHref="/vendor/campaigns"
        isPending={createMutation.isPending}
        onSubmit={async (input) => {
          await createMutation.mutateAsync({
            ...input,
            storeId,
          });
        }}
      />
    </>
  );
}
