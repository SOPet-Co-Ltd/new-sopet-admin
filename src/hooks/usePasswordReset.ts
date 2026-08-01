'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getPasswordResetTokenStatus,
  requestPasswordReset,
  resetPassword,
} from '@/lib/api/passwordReset';
import { queryKeys } from '@/lib/react-query/keys';

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
  });
}

/**
 * Eagerly checks the reset token on page load so an expired/used link shows a clear
 * message immediately, instead of only failing after the user fills in and submits a
 * new password (row 33 regression).
 */
export function usePasswordResetTokenStatus(token: string) {
  return useQuery({
    queryKey: queryKeys.auth.passwordResetTokenStatus(token),
    queryFn: () => getPasswordResetTokenStatus(token),
    enabled: !!token,
    retry: false,
  });
}
