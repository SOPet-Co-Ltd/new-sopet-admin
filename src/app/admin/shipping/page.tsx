'use client';

import { PageHeader } from '@/components/ui/card';
import { ShippingProvidersPanel } from '@/components/admin/shipping/shipping-providers-panel';
import { StoreShippingOptionsPanel } from '@/components/admin/shipping/store-shipping-options-panel';

export default function AdminShippingPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="การจัดส่ง"
        description="จัดการผู้ให้บริการขนส่งระดับแพลตฟอร์มและตรวจสอบราคาจัดส่งของแต่ละร้าน — ข้อมูลต้องชัดเจนและตรงกับที่ลูกค้าเห็นตอนชำระเงิน"
      />

      <ShippingProvidersPanel />
      <StoreShippingOptionsPanel />
    </div>
  );
}
