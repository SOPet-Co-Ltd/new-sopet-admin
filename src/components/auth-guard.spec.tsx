import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from '@/components/auth-guard';
import { hasClientSession } from '@/lib/api/client';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => mockPathname(),
}));

vi.mock('@/lib/api/client', () => ({
  hasClientSession: vi.fn(),
}));

const mockUseAuthStore = vi.fn();
const mockPathname = vi.fn(() => '/admin/stores');

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) =>
    mockUseAuthStore(selector),
}));

function mockAuthState(state: {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  user: { role: 'admin' | 'vendor'; mustChangePassword?: boolean } | null;
}) {
  mockUseAuthStore.mockImplementation((selector) =>
    selector({
      hasHydrated: state.hasHydrated,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
    }),
  );
}

describe('AuthGuard', () => {
  beforeEach(() => {
    replace.mockClear();
    mockPathname.mockReturnValue('/admin/stores');
    vi.mocked(hasClientSession).mockReturnValue(true);
  });

  it('shows loading shell while auth store is hydrating', () => {
    mockAuthState({
      hasHydrated: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <AuthGuard requiredRole="admin">
        <p>Protected content</p>
      </AuthGuard>,
    );

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects when hydrated user role mismatches required role', async () => {
    mockAuthState({
      hasHydrated: true,
      isAuthenticated: true,
      user: { role: 'vendor' },
    });

    render(
      <AuthGuard requiredRole="admin">
        <p>Protected content</p>
      </AuthGuard>,
    );

    expect(replace).toHaveBeenCalledWith('/vendor');
  });

  it('redirects admin with mustChangePassword away from non-profile routes', () => {
    mockPathname.mockReturnValue('/admin/stores');
    mockAuthState({
      hasHydrated: true,
      isAuthenticated: true,
      user: { role: 'admin', mustChangePassword: true },
    });

    render(
      <AuthGuard requiredRole="admin">
        <p>Protected content</p>
      </AuthGuard>,
    );

    expect(replace).toHaveBeenCalledWith('/admin/profile');
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('allows admin with mustChangePassword on profile route', () => {
    mockPathname.mockReturnValue('/admin/profile');
    mockAuthState({
      hasHydrated: true,
      isAuthenticated: true,
      user: { role: 'admin', mustChangePassword: true },
    });

    render(
      <AuthGuard requiredRole="admin">
        <p>Protected content</p>
      </AuthGuard>,
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects vendor with mustChangePassword to settings', () => {
    mockPathname.mockReturnValue('/vendor/products');
    mockAuthState({
      hasHydrated: true,
      isAuthenticated: true,
      user: { role: 'vendor', mustChangePassword: true },
    });

    render(
      <AuthGuard requiredRole="vendor">
        <p>Protected content</p>
      </AuthGuard>,
    );

    expect(replace).toHaveBeenCalledWith('/vendor/settings');
  });
});
