'use client';

import Link from 'next/link';
import { use } from 'react';
import { SaleCampaignForm } from '@/components/vendor/sale-campaign-form';
import { Card, CardBody } from '@/components/ui/card';
import { useStoreSaleCampaign, useUpdateSaleCampaign } from '@/hooks/useSaleCampaigns';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

export default function VendorSaleCampaignEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const storeId = useVendorStoreId();
  const { data: campaign, isLoading, error, isNotFound } = useStoreSaleCampaign(id, storeId);
  const updateMutation = useUpdateSaleCampaign();

  if (!storeId) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-muted">
            กรุณาเลือกร้านค้าจาก{' '}
            <Link href="/vendor/stores" className="text-brand underline">
              ร้านค้าของฉัน
            </Link>{' '}
            ก่อนแก้ไขแคมเปญ
          </p>
        </CardBody>
      </Card>
    );
  }

  if (isLoading) {
    return <p className="text-muted">กำลังโหลดแคมเปญ...</p>;
  }

  if (error || isNotFound || !campaign) {
    return (
      <p className="text-sm text-danger">
        {error instanceof Error ? error.message : 'ไม่พบแคมเปญ'}
      </p>
    );
  }

  return (
    <SaleCampaignForm
      campaign={campaign}
      title="แก้ไขแคมเปญ"
      backHref="/vendor/campaigns"
      listHref="/vendor/campaigns"
      isPending={updateMutation.isPending}
      onSubmit={async (input) => {
        await updateMutation.mutateAsync({
          id: campaign.id,
          input,
        });
      }}
    />
  );
}
