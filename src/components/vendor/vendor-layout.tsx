'use client';

import {
  HiBanknotes,
  HiBell,
  HiBuildingStorefront,
  HiCodeBracket,
  HiCog6Tooth,
  HiCube,
  HiHome,
  HiInboxArrowDown,
  HiShoppingBag,
  HiStar,
  HiTicket,
  HiUserGroup,
  HiUsers,
} from 'react-icons/hi2';
import { AuthGuard } from '@/components/auth-guard';
import { DashboardShell, type DashboardNavSection } from '@/components/dashboard-shell';
import { ActiveStoreDisplay } from '@/components/vendor/active-store-display';
import { EmailVerificationBanner } from '@/components/vendor/email-verification-banner';
import { SuspendedStoreBanner } from '@/components/vendor/suspended-store-banner';
import { VendorStoreGuard } from '@/components/vendor/vendor-store-guard';
import { useIsStoreManager, useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useMyStores } from '@/hooks/useMyStores';
import { useMyStoreRequests } from '@/hooks/useStoreRequests';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { useMyPendingStoreInvitations } from '@/hooks/useTeam';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { vendorHasStores } from '@/lib/vendor/vendor-store-access';

const storeSection = (pendingRequestCount?: number): DashboardNavSection => ({
  title: 'ร้านค้า',
  items: [
    { href: '/vendor', label: 'แดชบอร์ด', exact: true, icon: HiHome },
    { href: '/vendor/stores', label: 'ร้านค้าของฉัน', icon: HiBuildingStorefront },
    {
      href: '/vendor/requests',
      label: 'คำเชิญ / คำขอ',
      icon: HiInboxArrowDown,
      badge: pendingRequestCount,
    },
  ],
});

const salesSection = (pendingOrderCount?: number): DashboardNavSection => ({
  title: 'ขาย',
  items: [
    {
      href: '/vendor/orders?queue=action',
      label: 'คำสั่งซื้อ',
      icon: HiShoppingBag,
      badge: pendingOrderCount,
    },
    { href: '/vendor/products', label: 'สินค้า', icon: HiCube },
    { href: '/vendor/customers', label: 'ลูกค้า', icon: HiUsers },
    { href: '/vendor/reviews', label: 'รีวิว', icon: HiStar },
  ],
});

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

const accountSection = (isOwner: boolean): DashboardNavSection => ({
  title: 'บัญชี',
  items: [
    ...(isOwner
      ? [{ href: '/vendor/settings?tab=payout', label: 'รับเงิน', icon: HiBanknotes }]
      : []),
    { href: '/vendor/notifications', label: 'การแจ้งเตือน', icon: HiBell },
    { href: '/vendor/settings', label: 'ตั้งค่า', icon: HiCog6Tooth },
  ],
});

const noStoresNavSection = (pendingRequestCount?: number): DashboardNavSection => ({
  title: 'ร้านค้า',
  items: [
    { href: '/vendor/stores', label: 'ร้านค้าของฉัน', icon: HiBuildingStorefront },
    {
      href: '/vendor/requests',
      label: 'คำเชิญ / คำขอ',
      icon: HiInboxArrowDown,
      badge: pendingRequestCount,
    },
  ],
});

export function buildVendorNavSections({
  hasStores,
  isOwner,
  isManager,
  pendingOrderCount,
  pendingRequestCount,
}: {
  hasStores: boolean;
  isOwner: boolean;
  isManager: boolean;
  pendingOrderCount?: number;
  pendingRequestCount?: number;
}): DashboardNavSection[] {
  if (!hasStores) {
    return [noStoresNavSection(pendingRequestCount), accountSection(isOwner)];
  }

  return [
    storeSection(pendingRequestCount),
    salesSection(pendingOrderCount),
    marketingSection,
    ...(isOwner ? [teamSection] : []),
    ...(isManager ? [systemSection] : []),
    accountSection(isOwner),
  ];
}

export function VendorLayout({ children }: { children: React.ReactNode }) {
  const { data: stores = [], isLoading: isStoresLoading } = useMyStores();
  const storeId = useVendorStoreId();
  const { data: analytics } = useStoreAnalytics(storeId);
  const { data: pendingInvitations = [] } = useMyPendingStoreInvitations();
  const { data: storeRequests = [] } = useMyStoreRequests();
  const { isOwner } = useIsStoreOwner();
  const { isManager } = useIsStoreManager();

  const hasStores = vendorHasStores(stores);
  const pendingStoreRequestCount = storeRequests.filter(
    (request) => request.status === 'pending',
  ).length;
  const pendingRequestCount = pendingInvitations.length + pendingStoreRequestCount;

  const navSections = buildVendorNavSections({
    hasStores: isStoresLoading || hasStores,
    isOwner,
    isManager,
    pendingOrderCount: analytics?.pendingOrders,
    pendingRequestCount: pendingRequestCount > 0 ? pendingRequestCount : undefined,
  });

  const header = (
    <div className="mt-4 rounded-lg bg-surface p-3">
      <ActiveStoreDisplay />
    </div>
  );

  return (
    <AuthGuard requiredRole="vendor">
      <DashboardShell
        brandHref="/vendor"
        brandLabel="ผู้ขาย"
        navSections={navSections}
        header={header}
      >
        <EmailVerificationBanner />
        <SuspendedStoreBanner />
        <VendorStoreGuard>{children}</VendorStoreGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
