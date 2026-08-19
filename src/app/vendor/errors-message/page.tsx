import type { Metadata } from 'next';
import { ErrorMessagesCatalogPage } from '@/components/error-messages-catalog-page';

export const metadata: Metadata = {
  title: 'รหัสข้อผิดพลาด | SOPet Vendor',
  description: 'รายการรหัสข้อผิดพลาดและข้อความภาษาไทยสำหรับพอร์ทัลผู้ขาย',
  robots: { index: false, follow: false },
};

export default function VendorErrorsMessagePage() {
  return <ErrorMessagesCatalogPage />;
}
