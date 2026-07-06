'use client';

import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset, resetPassword } from '@/lib/api/passwordReset';

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
