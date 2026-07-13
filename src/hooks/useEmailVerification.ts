'use client';

import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCooldown } from '@/hooks/useCooldown';
import { normalizeError } from '@/lib/api/errors';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';
import { resendEmailVerification, verifyEmail } from '@/lib/api/emailVerification';
import { refreshAuthUser, syncEmailVerificationStatus } from '@/lib/auth-session';
import {
  EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
  getResendEmailVerificationButtonLabel,
} from '@/lib/email-verification/resend';
import { useAuthStore } from '@/stores/auth.store';

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      void syncEmailVerificationStatus();
    },
  });
}

export function useResendEmailVerification() {
  const { isCooldown, remainingSeconds, startCooldown } = useCooldown(
    EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
  );
  const mutation = useMutation({
    mutationFn: async () => {
      try {
        return await resendEmailVerification();
      } catch (error) {
        const apiError = normalizeError(error);
        if (apiError.code === 'EMAIL_ALREADY_VERIFIED') {
          await syncEmailVerificationStatus();
          return ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED;
        }
        throw error;
      }
    },
    onSuccess: () => startCooldown(),
  });

  return {
    ...mutation,
    isCooldown,
    cooldownSeconds: remainingSeconds,
    isResendDisabled: mutation.isPending || isCooldown,
    resendButtonLabel: getResendEmailVerificationButtonLabel({
      isPending: mutation.isPending,
      isCooldown,
      cooldownSeconds: remainingSeconds,
    }),
  };
}

/** Refreshes auth user when the persisted profile may be stale (e.g. admin verified email). */
export function useSyncEmailVerificationStatus() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !user || user.emailVerified === true) {
      return;
    }
    void refreshAuthUser();
  }, [hasHydrated, isAuthenticated, user]);
}
