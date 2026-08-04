'use client';

import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi2';
import { PageHeader } from '@/components/ui/card';
import { PromotionTypeSelector } from '@/components/promotions/promotion-type-selector';

export default function VendorPromotionTypePage() {
  return (
    <div>
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
      <PromotionTypeSelector basePath="/vendor/promotions/new" />
    </div>
  );
}
