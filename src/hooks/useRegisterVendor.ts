'use client';

import { useMutation } from '@tanstack/react-query';
import { registerVendor } from '@/lib/api/auth';
import { applyAuthenticatedSession } from '@/lib/auth/apply-session';
import type { LoginResult, RegisterVendorInput } from '@/types';

export function useRegisterVendor() {
  return useMutation<LoginResult, Error, RegisterVendorInput>({
    mutationFn: registerVendor,
    onSuccess: async (result) => {
      await applyAuthenticatedSession(result.user);
    },
  });
}
