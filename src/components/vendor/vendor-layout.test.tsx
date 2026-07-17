import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildVendorNavSections, VendorLayout } from './vendor-layout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/vendor/stores',
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useCurrentUser: vi.fn(),
  useLogout: vi.fn(),
}));

vi.mock('@/hooks/useMyStores', () => ({
  useMyStores: vi.fn(),
}));

vi.mock('@/hooks/useMembershipRole', () => ({
  useIsStoreOwner: vi.fn(),
  useIsStoreManager: vi.fn(),
}));

vi.mock('@/hooks/useVendorStoreId', () => ({
  useVendorStoreId: vi.fn(),
}));

vi.mock('@/hooks/useStoreAnalytics', () => ({
  useStoreAnalytics: vi.fn(),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

vi.mock('@/components/auth-guard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/vendor/vendor-store-guard', () => ({
  VendorStoreGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/vendor/active-store-display', () => ({
  ActiveStoreDisplay: () => <div data-testid="active-store-display" />,
}));

vi.mock('@/components/vendor/suspended-store-banner', () => ({
  SuspendedStoreBanner: () => null,
}));

vi.mock('@/components/vendor/email-verification-banner', () => ({
  EmailVerificationBanner: () => <div data-testid="email-verification-banner">banner</div>,
}));

vi.mock('@/lib/react-query/prefetch-dashboard-nav', () => ({
  createDashboardNavPrefetchHandlers: () => ({
    onMouseEnter: vi.fn(),
    onFocus: vi.fn(),
  }),
}));

import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { useMyStores } from '@/hooks/useMyStores';
import { useIsStoreManager, useIsStoreOwner } from '@/hooks/useMembershipRole';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { useTheme } from '@/hooks/useTheme';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';

const mockedUseCurrentUser = vi.mocked(useCurrentUser);
const mockedUseLogout = vi.mocked(useLogout);
const mockedUseMyStores = vi.mocked(useMyStores);
const mockedUseIsStoreOwner = vi.mocked(useIsStoreOwner);
const mockedUseIsStoreManager = vi.mocked(useIsStoreManager);
const mockedUseTheme = vi.mocked(useTheme);
const mockedUseVendorStoreId = vi.mocked(useVendorStoreId);
const mockedUseStoreAnalytics = vi.mocked(useStoreAnalytics);

function setupMocks({
  stores = [],
  isStoresLoading = false,
  isOwner = false,
  isManager = false,
}: {
  stores?: unknown[];
  isStoresLoading?: boolean;
  isOwner?: boolean;
  isManager?: boolean;
} = {}) {
  mockedUseLogout.mockReturnValue(vi.fn());
  mockedUseTheme.mockReturnValue({
    theme: 'light',
    mounted: true,
    toggleTheme: vi.fn(),
    isDark: false,
    setTheme: vi.fn(),
    systemTheme: 'light',
    storedTheme: null,
  });
  mockedUseCurrentUser.mockReturnValue({
    user: {
      id: '1',
      email: 'vendor@sopet.org',
      fullName: 'Vendor User',
      role: 'vendor',
    },
    isAuthenticated: true,
  });
  mockedUseMyStores.mockReturnValue({
    data: stores,
    isLoading: isStoresLoading,
  } as ReturnType<typeof useMyStores>);
  mockedUseIsStoreOwner.mockReturnValue({
    isOwner,
    membershipRole: isOwner ? 'owner' : undefined,
    isLoading: false,
  });
  mockedUseIsStoreManager.mockReturnValue({
    isManager,
    membershipRole: isManager ? 'manager' : undefined,
    isLoading: false,
  });
  mockedUseVendorStoreId.mockReturnValue('store-1');
  mockedUseStoreAnalytics.mockReturnValue({
    data: undefined,
  } as ReturnType<typeof useStoreAnalytics>);
}

describe('buildVendorNavSections', () => {
  it('returns ร้านค้าของฉัน, การแจ้งเตือน, and ตั้งค่า when vendor has no stores', () => {
    const sections = buildVendorNavSections({ hasStores: false, isOwner: false, isManager: false });

    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe('ร้านค้า');
    expect(sections[0].items).toEqual([
      expect.objectContaining({ href: '/vendor/stores', label: 'ร้านค้าของฉัน' }),
    ]);
    expect(sections[1].title).toBe('บัญชี');
    expect(sections[1].items).toEqual([
      expect.objectContaining({ href: '/vendor/notifications', label: 'การแจ้งเตือน' }),
      expect.objectContaining({ href: '/vendor/settings', label: 'ตั้งค่า' }),
    ]);
  });

  it('includes payout nav for store owners', () => {
    const sections = buildVendorNavSections({ hasStores: true, isOwner: true, isManager: false });

    const labels = sections.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toContain('รับเงิน');
  });

  it('omits payout nav for non-owners', () => {
    const sections = buildVendorNavSections({ hasStores: true, isOwner: false, isManager: false });

    const labels = sections.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).not.toContain('รับเงิน');
  });

  it('returns full nav when vendor has stores', () => {
    const sections = buildVendorNavSections({ hasStores: true, isOwner: true, isManager: true });

    const labels = sections.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toContain('แดชบอร์ด');
    expect(labels).toContain('ร้านค้าของฉัน');
    expect(labels).toContain('คำสั่งซื้อ');
    expect(labels).toContain('สินค้า');
    expect(labels).toContain('ลูกค้า');
    expect(labels).toContain('รีวิว');
    expect(labels).toContain('โปรโมชัน');
    expect(labels).toContain('ทีมงาน');
    expect(labels).toContain('API');
    expect(labels).toContain('การแจ้งเตือน');
    expect(labels).toContain('ตั้งค่า');
  });

  it('omits team and API sections for non-owner non-manager members', () => {
    const sections = buildVendorNavSections({ hasStores: true, isOwner: false, isManager: false });

    const labels = sections.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).not.toContain('ทีมงาน');
    expect(labels).not.toContain('API');
  });
});

describe('VendorLayout sidebar nav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows full nav while stores are loading', () => {
    setupMocks({ isStoresLoading: true });

    render(
      <VendorLayout>
        <div>content</div>
      </VendorLayout>,
    );

    expect(screen.getByRole('link', { name: 'แดชบอร์ด' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'คำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ตั้งค่า' })).toBeInTheDocument();
  });

  it('shows limited nav when vendor has no stores', () => {
    setupMocks({ stores: [] });

    render(
      <VendorLayout>
        <div>content</div>
      </VendorLayout>,
    );

    expect(screen.getByRole('link', { name: 'ร้านค้าของฉัน' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'การแจ้งเตือน' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ตั้งค่า' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'แดชบอร์ด' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'คำสั่งซื้อ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'โปรโมชัน' })).not.toBeInTheDocument();
  });

  it('shows email verification banner in vendor shell', () => {
    setupMocks({ stores: [] });

    render(
      <VendorLayout>
        <div>content</div>
      </VendorLayout>,
    );

    expect(screen.getByTestId('email-verification-banner')).toBeInTheDocument();
  });

  it('shows full nav when vendor has stores', () => {
    setupMocks({
      stores: [{ store: { id: 'store-1', name: 'Test Store' }, membershipRole: 'owner' }],
      isOwner: true,
      isManager: true,
    });

    render(
      <VendorLayout>
        <div>content</div>
      </VendorLayout>,
    );

    expect(screen.getByRole('link', { name: 'แดชบอร์ด' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ร้านค้าของฉัน' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'คำสั่งซื้อ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'สินค้า' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'รับเงิน' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ตั้งค่า' })).toBeInTheDocument();
  });
});
