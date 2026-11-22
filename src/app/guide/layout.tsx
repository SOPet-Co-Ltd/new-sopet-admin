import type { Metadata } from 'next';
import { GuideShell } from '@/components/help/guide-shell';

export const metadata: Metadata = {
  title: {
    default: 'คู่มือ SOPet',
    template: '%s | คู่มือ SOPet',
  },
  description: 'คู่มือการใช้งานอย่างเป็นทางการของ SOPet สำหรับผู้ดูแลระบบและผู้ขาย',
  robots: { index: true, follow: true },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <GuideShell>{children}</GuideShell>;
}
