import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout, buildAdminNavSections } from './admin-layout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/requests',
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

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

vi.mock('@/hooks/useStoreRequests', () => ({
  usePendingStoreRequests: vi.fn(),
}));

vi.mock('@/hooks/useVendorInvitations', () => ({
  usePendingVendorInvitations: vi.fn(),
}));

vi.mock('@/hooks/useTaxonomy', () => ({
  usePendingCategories: vi.fn(),
  usePendingTags: vi.fn(),
  usePendingPetTypes: vi.fn(),
  usePendingBrands: vi.fn(),
}));

vi.mock('@/hooks/useNotifications', () => ({
  useUnreadCount: vi.fn(),
}));

vi.mock('@/components/auth-guard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/lib/react-query/prefetch-dashboard-nav', () => ({
  createDashboardNavPrefetchHandlers: () => ({
    onMouseEnter: vi.fn(),
    onFocus: vi.fn(),
  }),
}));

import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { useUnreadCount } from '@/hooks/useNotifications';
import { usePendingStoreRequests } from '@/hooks/useStoreRequests';
import {
  usePendingBrands,
  usePendingCategories,
  usePendingPetTypes,
  usePendingTags,
} from '@/hooks/useTaxonomy';
import { useTheme } from '@/hooks/useTheme';
import { usePendingVendorInvitations } from '@/hooks/useVendorInvitations';

const mockedUseCurrentUser = vi.mocked(useCurrentUser);
const mockedUseLogout = vi.mocked(useLogout);
const mockedUseTheme = vi.mocked(useTheme);
const mockedUsePendingStoreRequests = vi.mocked(usePendingStoreRequests);
const mockedUsePendingVendorInvitations = vi.mocked(usePendingVendorInvitations);
const mockedUsePendingCategories = vi.mocked(usePendingCategories);
const mockedUsePendingTags = vi.mocked(usePendingTags);
const mockedUsePendingPetTypes = vi.mocked(usePendingPetTypes);
const mockedUsePendingBrands = vi.mocked(usePendingBrands);
const mockedUseUnreadCount = vi.mocked(useUnreadCount);

function setupMocks({
  storeRequests = [],
  invitations = [],
  pendingCategories = [],
  pendingTags = [],
  pendingPetTypes = [],
  pendingBrands = [],
  unreadNotificationCount = 0,
}: {
  storeRequests?: unknown[];
  invitations?: unknown[];
  pendingCategories?: unknown[];
  pendingTags?: unknown[];
  pendingPetTypes?: unknown[];
  pendingBrands?: unknown[];
  unreadNotificationCount?: number;
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
      email: 'admin@sopet.org',
      fullName: 'Admin User',
      role: 'admin',
    },
    isAuthenticated: true,
  });
  mockedUsePendingStoreRequests.mockReturnValue({
    data: storeRequests,
  } as ReturnType<typeof usePendingStoreRequests>);
  mockedUsePendingVendorInvitations.mockReturnValue({
    data: invitations,
  } as ReturnType<typeof usePendingVendorInvitations>);
  mockedUsePendingCategories.mockReturnValue({
    data: pendingCategories,
  } as ReturnType<typeof usePendingCategories>);
  mockedUsePendingTags.mockReturnValue({
    data: pendingTags,
  } as ReturnType<typeof usePendingTags>);
  mockedUsePendingPetTypes.mockReturnValue({
    data: pendingPetTypes,
  } as ReturnType<typeof usePendingPetTypes>);
  mockedUsePendingBrands.mockReturnValue({
    data: pendingBrands,
  } as ReturnType<typeof usePendingBrands>);
  mockedUseUnreadCount.mockReturnValue({
    data: unreadNotificationCount,
  } as ReturnType<typeof useUnreadCount>);
}

describe('buildAdminNavSections', () => {
  it('adds a badge to ศูนย์คำขอ when pending requests exist', () => {
    const sections = buildAdminNavSections({ pendingRequestCount: 3 });
    const requestsItem = sections
      .flatMap((section) => section.items)
      .find((item) => item.href === '/admin/requests');

    expect(requestsItem).toEqual(expect.objectContaining({ label: 'ศูนย์คำขอ', badge: 3 }));
  });

  it('adds a badge to หมวดหมู่และแท็ก when pending taxonomy items exist', () => {
    const sections = buildAdminNavSections({ pendingTaxonomyCount: 5 });
    const taxonomyItem = sections
      .flatMap((section) => section.items)
      .find((item) => item.href === '/admin/taxonomy');

    expect(taxonomyItem).toEqual(expect.objectContaining({ label: 'หมวดหมู่และแท็ก', badge: 5 }));
  });

  it('adds a badge to การแจ้งเตือน when unread notifications exist', () => {
    const sections = buildAdminNavSections({ unreadNotificationCount: 4 });
    const notificationsItem = sections
      .flatMap((section) => section.items)
      .find((item) => item.href === '/admin/notifications');

    expect(notificationsItem).toEqual(expect.objectContaining({ label: 'การแจ้งเตือน', badge: 4 }));
  });

  it('omits badges when counts are undefined', () => {
    const sections = buildAdminNavSections();
    const items = sections.flatMap((section) => section.items);
    const requestsItem = items.find((item) => item.href === '/admin/requests');
    const taxonomyItem = items.find((item) => item.href === '/admin/taxonomy');
    const notificationsItem = items.find((item) => item.href === '/admin/notifications');

    expect(requestsItem?.badge).toBeUndefined();
    expect(taxonomyItem?.badge).toBeUndefined();
    expect(notificationsItem?.badge).toBeUndefined();
  });
});

describe('AdminLayout sidebar badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the combined pending request count on ศูนย์คำขอ', () => {
    setupMocks({
      storeRequests: [{ id: 's1' }, { id: 's2' }],
      invitations: [{ id: 'i1' }],
    });

    render(
      <AdminLayout>
        <div>content</div>
      </AdminLayout>,
    );

    expect(screen.getByRole('link', { name: /ศูนย์คำขอ/ })).toHaveTextContent('3');
  });

  it('shows the combined pending taxonomy count on หมวดหมู่และแท็ก', () => {
    setupMocks({
      pendingCategories: [{ id: 'c1' }],
      pendingTags: [{ id: 't1' }, { id: 't2' }],
      pendingPetTypes: [{ id: 'p1' }],
      pendingBrands: [{ id: 'b1' }],
    });

    render(
      <AdminLayout>
        <div>content</div>
      </AdminLayout>,
    );

    expect(screen.getByRole('link', { name: /หมวดหมู่และแท็ก/ })).toHaveTextContent('5');
  });

  it('shows the unread notification count on การแจ้งเตือน', () => {
    setupMocks({ unreadNotificationCount: 7 });

    render(
      <AdminLayout>
        <div>content</div>
      </AdminLayout>,
    );

    expect(screen.getByRole('link', { name: /การแจ้งเตือน/ })).toHaveTextContent('7');
  });

  it('hides badges when there are no pending items', () => {
    setupMocks();

    render(
      <AdminLayout>
        <div>content</div>
      </AdminLayout>,
    );

    const requestsLink = screen.getByRole('link', { name: 'ศูนย์คำขอ' });
    const taxonomyLink = screen.getByRole('link', { name: 'หมวดหมู่และแท็ก' });
    const notificationsLink = screen.getByRole('link', { name: 'การแจ้งเตือน' });
    expect(requestsLink).not.toHaveTextContent(/\d/);
    expect(taxonomyLink).not.toHaveTextContent(/\d/);
    expect(notificationsLink).not.toHaveTextContent(/\d/);
  });
});
