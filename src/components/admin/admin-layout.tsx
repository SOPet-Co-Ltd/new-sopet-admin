'use client';

import {
  HiArrowPath,
  HiBell,
  HiBuildingStorefront,
  HiChartBarSquare,
  HiClipboardDocumentList,
  HiCog6Tooth,
  HiInboxArrowDown,
  HiShieldCheck,
  HiMagnifyingGlass,
  HiTag,
  HiTicket,
  HiTruck,
  HiUserCircle,
  HiUserGroup,
  HiUsers,
} from 'react-icons/hi2';
import { AuthGuard } from '@/components/auth-guard';
import { DashboardShell, type DashboardNavSection } from '@/components/dashboard-shell';

const navSections: DashboardNavSection[] = [
  {
    title: 'ภาพรวม',
    items: [{ href: '/admin/analytics', label: 'ภาพรวม', icon: HiChartBarSquare }],
  },
  {
    title: 'จัดการ',
    items: [
      { href: '/admin/stores', label: 'ร้านค้า', icon: HiBuildingStorefront },
      { href: '/admin/vendors', label: 'ผู้ขาย', icon: HiUserGroup },
      { href: '/admin/customers', label: 'ลูกค้า', icon: HiUsers },
    ],
  },
  {
    title: 'คำขอ',
    items: [
      { href: '/admin/requests', label: 'ศูนย์คำขอ', icon: HiInboxArrowDown },
      { href: '/admin/reactivation-requests', label: 'เปิดใช้งานร้าน', icon: HiArrowPath },
    ],
  },
  {
    title: 'การตลาด',
    items: [
      { href: '/admin/promotions', label: 'โปรโมชัน', icon: HiTicket },
      { href: '/admin/taxonomy', label: 'หมวดหมู่และแท็ก', icon: HiTag },
      { href: '/admin/shipping', label: 'การจัดส่ง', icon: HiTruck },
    ],
  },
  {
    title: 'การค้นหา',
    items: [
      { href: '/admin/search/synonyms', label: 'คำพ้องความหมาย', icon: HiMagnifyingGlass },
      { href: '/admin/search/tuning', label: 'ปรับการจัดอันดับ', icon: HiMagnifyingGlass },
      { href: '/admin/search/analytics', label: 'วิเคราะห์การค้นหา', icon: HiMagnifyingGlass },
    ],
  },
  {
    title: 'บัญชี',
    items: [
      { href: '/admin/audit-logs', label: 'บันทึกการใช้งาน', icon: HiClipboardDocumentList },
      { href: '/admin/notifications', label: 'การแจ้งเตือน', icon: HiBell },
      { href: '/admin/settings', label: 'ตั้งค่าแพลตฟอร์ม', icon: HiCog6Tooth },
      { href: '/admin/team', label: 'ทีมผู้ดูแล', icon: HiShieldCheck },
      { href: '/admin/profile', label: 'โปรไฟล์', icon: HiUserCircle },
    ],
  },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <DashboardShell brandHref="/admin" brandLabel="Admin" navSections={navSections}>
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
