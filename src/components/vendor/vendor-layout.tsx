'use client';

import {
  HiBell,
  HiBuildingStorefront,
  HiCodeBracket,
  HiCog6Tooth,
  HiCube,
  HiHome,
  HiShoppingBag,
  HiStar,
  HiTicket,
  HiUserGroup,
  HiUsers,
} from 'react-icons/hi2';
import { AuthGuard } from '@/components/auth-guard';
import { DashboardShell, type DashboardNavSection } from '@/components/dashboard-shell';
import { ActiveStoreDisplay } from '@/components/vendor/active-store-display';
import { SuspendedStoreBanner } from '@/components/vendor/suspended-store-banner';
import { useCurrentUser } from '@/hooks/useAuth';
import { useIsStoreManager, useIsStoreOwner } from '@/hooks/useMembershipRole';

const storeSection: DashboardNavSection = {
  title: 'ร้านค้า',
  items: [
    { href: '/vendor', label: 'แดชบอร์ด', exact: true, icon: HiHome },
    { href: '/vendor/stores', label: 'ร้านค้าของฉัน', icon: HiBuildingStorefront },
  ],
};

const salesSection: DashboardNavSection = {
  title: 'ขาย',
  items: [
    { href: '/vendor/orders', label: 'คำสั่งซื้อ', icon: HiShoppingBag },
    { href: '/vendor/products', label: 'สินค้า', icon: HiCube },
    { href: '/vendor/customers', label: 'ลูกค้า', icon: HiUsers },
    { href: '/vendor/reviews', label: 'รีวิว', icon: HiStar },
  ],
};

const marketingSection: DashboardNavSection = {
  title: 'การตลาด',
  items: [{ href: '/vendor/promotions', label: 'โปรโมชัน', icon: HiTicket }],
};

const teamSection: DashboardNavSection = {
  title: 'ทีม',
  items: [{ href: '/vendor/team', label: 'ทีมงาน', icon: HiUserGroup }],
};

const systemSection: DashboardNavSection = {
  title: 'ระบบ',
  items: [{ href: '/vendor/api', label: 'API', icon: HiCodeBracket }],
};

const accountSection: DashboardNavSection = {
  title: 'บัญชี',
  items: [
    { href: '/vendor/notifications', label: 'การแจ้งเตือน', icon: HiBell },
    { href: '/vendor/settings', label: 'ตั้งค่า', icon: HiCog6Tooth },
  ],
};

export function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const { isOwner } = useIsStoreOwner();
  const { isManager } = useIsStoreManager();

  const navSections: DashboardNavSection[] = [
    storeSection,
    salesSection,
    marketingSection,
    ...(isOwner ? [teamSection] : []),
    ...(isManager ? [systemSection] : []),
    accountSection,
  ];

  const header = (
    <>
      {user ? <p className="mt-2 truncate text-sm text-muted">{user.fullName}</p> : null}
      <div className="mt-4 rounded-lg bg-surface p-3">
        <ActiveStoreDisplay />
      </div>
    </>
  );

  return (
    <AuthGuard requiredRole="vendor">
      <DashboardShell
        brandHref="/vendor"
        brandLabel="Vendor"
        navSections={navSections}
        header={header}
      >
        <SuspendedStoreBanner />
        {children}
      </DashboardShell>
    </AuthGuard>
  );
}
