import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from '@/components/auth-guard';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

vi.mock('@/lib/api/client', () => ({
  getAccessToken: vi.fn(() => 'token'),
}));

const mockUseAuthStore = vi.fn();

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) =>
    mockUseAuthStore(selector),
}));

function mockAuthState(state: {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  user: { role: 'admin' | 'vendor' } | null;
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
  });

  it('renders children directly while auth store is hydrating', () => {
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

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText('กำลังโหลด...')).not.toBeInTheDocument();
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
});
