'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/ui/card';
import { PromotionTypeSelector } from '@/components/promotions/promotion-type-selector';
import { Button } from '@/components/ui/button';

export default function VendorPromotionTypePage() {
  return (
    <div>
      <PageHeader
        title="สร้างโปรโมชัน"
        description="เลือกประเภทโปรโมชันที่ต้องการสร้าง"
        action={
          <Button variant="outline" asChild>
            <Link href="/vendor/promotions">กลับ</Link>
          </Button>
        }
      />
      <PromotionTypeSelector basePath="/vendor/promotions/new" />
    </div>
  );
}
