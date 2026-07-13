import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors-core';
import { resendEmailVerification } from '@/lib/api/emailVerification';
import { syncEmailVerificationStatus } from '@/lib/auth-session';
import { useAuthStore } from '@/stores/auth.store';
import { useResendEmailVerification } from './useEmailVerification';

const startCooldownMock = vi.fn();

vi.mock('@/lib/api/emailVerification', () => ({
  resendEmailVerification: vi.fn(),
}));

vi.mock('@/lib/auth-session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth-session')>('@/lib/auth-session');
  return {
    ...actual,
    syncEmailVerificationStatus: vi.fn(),
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

describe('useResendEmailVerification', () => {
  beforeEach(() => {
    startCooldownMock.mockReset();
    vi.mocked(resendEmailVerification).mockResolvedValue('Email verification sent');
    vi.mocked(syncEmailVerificationStatus).mockResolvedValue();
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'vendor@test.com',
        fullName: 'Vendor',
        role: 'vendor',
        emailVerified: false,
      },
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
