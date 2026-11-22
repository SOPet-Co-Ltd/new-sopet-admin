import type { Metadata } from 'next';
import { HelpIndex } from '@/components/help/help-index';

export const metadata: Metadata = {
  title: 'คู่มือผู้ขาย',
  description: 'คู่มือการใช้งานพอร์ทัล Vendor ของ SOPet (ภาษาไทย) — อ่านได้โดยไม่ต้องเข้าสู่ระบบ',
};

export default function GuideVendorIndexPage() {
  return (
    <HelpIndex
      role="vendor"
      title="คู่มือการใช้งานผู้ขาย"
      description="คำอธิบายละเอียดทุกฟังก์ชันในพอร์ทัล Vendor ของ SOPet — คู่มืออย่างเป็นทางการ (ภาษาไทย)"
    />
  );
}
