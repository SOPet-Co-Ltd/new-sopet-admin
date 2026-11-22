'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { HiArrowLeft } from 'react-icons/hi2';
import { PageHeader } from '@/components/ui/card';
import { PromotionTypeSelector } from '@/components/promotions/promotion-type-selector';
import { ActionGuideSpotlight } from '@/components/vendor/product-tour/action-guide-spotlight';
import { useBootstrapActionGuide } from '@/lib/vendor/use-bootstrap-action-guide';

function PromotionTypeGuideBootstrap() {
  useBootstrapActionGuide('create-promotion');
  return <ActionGuideSpotlight guideId="create-promotion" />;
}

export default function VendorPromotionTypePage() {
  return (
    <div>
      <Suspense fallback={null}>
        <PromotionTypeGuideBootstrap />
      </Suspense>
      <PageHeader
        title="สร้างโปรโมชัน"
        description="เลือกประเภทโปรโมชันที่ต้องการสร้าง"
        back={
          <Link
            href="/vendor/promotions"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-200 ease-out hover:text-brand motion-reduce:transition-none"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับไปรายการโปรโมชัน
          </Link>
        }
      />
      <PromotionTypeSelector basePath="/vendor/promotions/new" tourId="action-promo-type" />
    </div>
  );
}
