import type { Metadata } from 'next';
import { HelpIndex } from '@/components/help/help-index';

export const metadata: Metadata = {
  title: 'คู่มือผู้ดูแลระบบ',
  description: 'คู่มือการใช้งานพอร์ทัล Admin ของ SOPet (ภาษาไทย) — อ่านได้โดยไม่ต้องเข้าสู่ระบบ',
};

export default function GuideAdminIndexPage() {
  return (
    <HelpIndex
      role="admin"
      title="คู่มือการใช้งานผู้ดูแลระบบ"
      description="คำอธิบายละเอียดทุกฟังก์ชันในพอร์ทัล Admin ของ SOPet — คู่มืออย่างเป็นทางการ (ภาษาไทย)"
    />
  );
}
