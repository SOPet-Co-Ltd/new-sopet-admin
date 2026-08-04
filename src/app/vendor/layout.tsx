import type { Metadata } from 'next';
import { VendorLayout } from '@/components/vendor/vendor-layout';

export const metadata: Metadata = {
  title: {
    absolute: 'SOPet Vendor',
  },
  description: 'พอร์ทัลผู้ขาย SOPet',
};

export default function VendorRootLayout({ children }: { children: React.ReactNode }) {
  return <VendorLayout>{children}</VendorLayout>;
}
