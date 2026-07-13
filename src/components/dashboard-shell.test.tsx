import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardShell } from './dashboard-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/analytics',
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

vi.mock('@/lib/react-query/prefetch-dashboard-nav', () => ({
  createDashboardNavPrefetchHandlers: () => ({
    onMouseEnter: vi.fn(),
    onFocus: vi.fn(),
  }),
}));

import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const mockedUseCurrentUser = vi.mocked(useCurrentUser);
const mockedUseLogout = vi.mocked(useLogout);
const mockedUseTheme = vi.mocked(useTheme);

const navSections = [
  {
    title: 'ภาพรวม',
    items: [{ href: '/admin/analytics', label: 'ภาพรวม', exact: true }],
  },
];

describe('DashboardShell sidebar footer', () => {
  beforeEach(() => {
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
  });

  it('shows user info, labeled theme toggle, and logout action in sidebar footer', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: {
        id: '1',
        email: 'admin@sopet.org',
        fullName: 'Admin User',
        role: 'admin',
      },
      isAuthenticated: true,
    });

    render(
      <DashboardShell brandHref="/admin" brandLabel="Admin" navSections={navSections}>
        <div>content</div>
      </DashboardShell>,
    );

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@sopet.org')).toBeInTheDocument();
    expect(screen.getByText('โหมดสว่าง')).toBeInTheDocument();
    expect(screen.getByText('สลับ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ออกจากระบบ' })).toBeInTheDocument();
  });

  it('calls logout when logout action is clicked', async () => {
    const logout = vi.fn();
    mockedUseLogout.mockReturnValue(logout);
    mockedUseCurrentUser.mockReturnValue({
      user: {
        id: '1',
        email: 'admin@sopet.org',
        fullName: 'Admin User',
        role: 'admin',
      },
      isAuthenticated: true,
    });

    render(
      <DashboardShell brandHref="/admin" brandLabel="Admin" navSections={navSections}>
        <div>content</div>
      </DashboardShell>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'ออกจากระบบ' }));

    expect(logout).toHaveBeenCalledOnce();
  });

  it('hides user info when user is not available', () => {
    mockedUseCurrentUser.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    render(
      <DashboardShell brandHref="/admin" brandLabel="Admin" navSections={navSections}>
        <div>content</div>
      </DashboardShell>,
    );

    expect(screen.queryByText('admin@sopet.org')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ออกจากระบบ' })).toBeInTheDocument();
  });
});
