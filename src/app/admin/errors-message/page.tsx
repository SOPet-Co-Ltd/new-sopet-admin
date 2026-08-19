import type { Metadata } from 'next';
import { ErrorMessagesCatalogPage } from '@/components/error-messages-catalog-page';

export const metadata: Metadata = {
  title: 'รหัสข้อผิดพลาด | SOPet Admin',
  description: 'รายการรหัสข้อผิดพลาดและข้อความภาษาไทยสำหรับพอร์ทัลแอดมิน',
  robots: { index: false, follow: false },
};

export default function AdminErrorsMessagePage() {
  return <ErrorMessagesCatalogPage />;
}
