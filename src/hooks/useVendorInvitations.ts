'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptVendorInvitation,
  getPendingVendorInvitations,
  inviteVendor,
} from '@/lib/api/vendor-invitations';
import { applyAuthenticatedSession } from '@/lib/auth/apply-session';
import { queryKeys } from '@/lib/react-query/keys';
import type { InviteVendorInput, LoginResult } from '@/types';

export function usePendingVendorInvitations() {
  return useQuery({
    queryKey: queryKeys.vendorInvitations.pending(),
    queryFn: getPendingVendorInvitations,
  });
}

export function useInviteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteVendorInput) => inviteVendor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorInvitations.all });
    },
  });
}

export function useAcceptVendorInvitation() {
  return useMutation<LoginResult, Error, { token: string; password: string; fullName: string }>({
    mutationFn: acceptVendorInvitation,
    onSuccess: async (result) => {
      await applyAuthenticatedSession(result.user);
    },
  });
}
