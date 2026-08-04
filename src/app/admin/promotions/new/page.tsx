'use client';

import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi2';
import { PageHeader } from '@/components/ui/card';
import { PromotionTypeSelector } from '@/components/promotions/promotion-type-selector';

export default function AdminPromotionTypePage() {
  return (
    <div>
      <PageHeader
        title="สร้างโปรโมชันแพลตฟอร์ม"
        description="เลือกประเภทโปรโมชันระดับแพลตฟอร์มที่ใช้ได้ทั้งตลาด"
        back={
          <Link
            href="/admin/promotions"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:text-brand focus-visible:text-brand motion-reduce:transition-none"
          >
            <HiArrowLeft className="size-3.5 shrink-0" aria-hidden="true" />
            กลับไปรายการโปรโมชัน
          </Link>
        }
      />
      <PromotionTypeSelector basePath="/admin/promotions/new" />
    </div>
  );
}
