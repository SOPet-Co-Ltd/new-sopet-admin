'use client';

import { useEffect, useState } from 'react';
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

/**
 * Refreshes auth user when the persisted profile may be stale (e.g. admin verified email).
 *
 * Returns `isChecking: true` until that freshness check has settled, so callers (e.g. the
 * unverified-email banner) can avoid flashing a stale "unverified" state for a vendor whose
 * persisted `emailVerified: false` is simply out of date (verified in another tab/session)
 * and is about to be corrected by this same round-trip.
 */
export function useSyncEmailVerificationStatus(): { isChecking: boolean } {
  const userId = useAuthStore((s) => s.user?.id);
  const emailVerified = useAuthStore((s) => s.user?.emailVerified);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Depend on primitives (id / emailVerified), not the user object — refreshAuthUser
    // always setUser() with a new reference, which would infinite-loop Me while unverified.
    if (!hasHydrated || !isAuthenticated || !userId || emailVerified === true) {
      // Must flip synchronously (not e.g. via a derived render-time value) so isChecking
      // is correct the instant hydration/auth settles, before the caller's next paint.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    setIsChecking(true);
    void refreshAuthUser().finally(() => {
      if (!cancelled) {
        setIsChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, userId, emailVerified]);

  return { isChecking };
}
