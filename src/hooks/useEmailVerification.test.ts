import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors-core';
import { resendEmailVerification } from '@/lib/api/emailVerification';
import { refreshAuthUser, syncEmailVerificationStatus } from '@/lib/auth-session';
import { useAuthStore } from '@/stores/auth.store';
import { useResendEmailVerification, useSyncEmailVerificationStatus } from './useEmailVerification';

const startCooldownMock = vi.fn();

vi.mock('@/lib/api/emailVerification', () => ({
  resendEmailVerification: vi.fn(),
}));

vi.mock('@/lib/auth-session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth-session')>('@/lib/auth-session');
  return {
    ...actual,
    syncEmailVerificationStatus: vi.fn(),
    refreshAuthUser: vi.fn(),
  };
});

vi.mock('@/hooks/useCooldown', () => ({
  useCooldown: () => ({
    isCooldown: false,
    remainingSeconds: 0,
    startCooldown: startCooldownMock,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const unverifiedVendor = {
  id: '1',
  email: 'vendor@test.com',
  fullName: 'Vendor',
  role: 'vendor' as const,
  emailVerified: false,
};

describe('useResendEmailVerification', () => {
  beforeEach(() => {
    startCooldownMock.mockReset();
    vi.mocked(resendEmailVerification).mockResolvedValue('Email verification sent');
    vi.mocked(syncEmailVerificationStatus).mockResolvedValue();
    useAuthStore.setState({
      user: unverifiedVendor,
      isAuthenticated: true,
      hasHydrated: true,
    });
  });

  it('starts cooldown after successful resend', async () => {
    const { result } = renderHook(() => useResendEmailVerification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(startCooldownMock).toHaveBeenCalledOnce();
  });

  it('does not start cooldown when resend fails', async () => {
    vi.mocked(resendEmailVerification).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useResendEmailVerification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(startCooldownMock).not.toHaveBeenCalled();
  });

  it('treats already-verified resend as success and syncs session', async () => {
    vi.mocked(resendEmailVerification).mockRejectedValue(
      new ApiError({
        code: 'EMAIL_ALREADY_VERIFIED',
        message: 'Email is already verified',
        status: 400,
      }),
    );

    const { result } = renderHook(() => useResendEmailVerification(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(syncEmailVerificationStatus).toHaveBeenCalledOnce();
    expect(startCooldownMock).toHaveBeenCalledOnce();
  });
});

describe('useSyncEmailVerificationStatus', () => {
  beforeEach(() => {
    vi.mocked(refreshAuthUser).mockReset();
    vi.mocked(refreshAuthUser).mockResolvedValue(null);
    useAuthStore.setState({
      user: unverifiedVendor,
      isAuthenticated: true,
      hasHydrated: true,
    });
  });

  it('refreshes auth once for an unverified user', async () => {
    renderHook(() => useSyncEmailVerificationStatus());

    await waitFor(() => expect(refreshAuthUser).toHaveBeenCalledOnce());
  });

  it('does not re-refresh when setUser replaces user with same id and emailVerified', async () => {
    renderHook(() => useSyncEmailVerificationStatus());
    await waitFor(() => expect(refreshAuthUser).toHaveBeenCalledOnce());

    act(() => {
      useAuthStore.getState().setUser({ ...unverifiedVendor });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAuthUser).toHaveBeenCalledOnce();
  });

  it('does not refresh when email is already verified', async () => {
    useAuthStore.setState({
      user: { ...unverifiedVendor, emailVerified: true },
      isAuthenticated: true,
      hasHydrated: true,
    });

    renderHook(() => useSyncEmailVerificationStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAuthUser).not.toHaveBeenCalled();
  });

  it('reports isChecking:true while the freshness check is in flight, then false once it settles', async () => {
    let resolveRefresh!: (value: null) => void;
    vi.mocked(refreshAuthUser).mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const { result } = renderHook(() => useSyncEmailVerificationStatus());

    expect(result.current.isChecking).toBe(true);

    resolveRefresh(null);
    await waitFor(() => expect(result.current.isChecking).toBe(false));
  });

  it('reports isChecking:false immediately when email is already verified (no refresh needed)', () => {
    useAuthStore.setState({
      user: { ...unverifiedVendor, emailVerified: true },
      isAuthenticated: true,
      hasHydrated: true,
    });

    const { result } = renderHook(() => useSyncEmailVerificationStatus());

    expect(result.current.isChecking).toBe(false);
    expect(refreshAuthUser).not.toHaveBeenCalled();
  });
});
