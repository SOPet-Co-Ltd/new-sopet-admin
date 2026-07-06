'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/ui/card';
import { PromotionTypeSelector } from '@/components/promotions/promotion-type-selector';
import { Button } from '@/components/ui/button';

export default function AdminPromotionTypePage() {
  return (
    <div>
      <PageHeader
        title="สร้างโปรโมชันแพลตฟอร์ม"
        description="เลือกประเภทโปรโมชันที่ต้องการสร้าง"
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/promotions">กลับ</Link>
          </Button>
        }
      />
      <PromotionTypeSelector basePath="/admin/promotions/new" />
    </div>
  );
}
