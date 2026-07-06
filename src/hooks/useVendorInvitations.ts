'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptVendorInvitation,
  getPendingVendorInvitations,
  inviteVendor,
} from '@/lib/api/vendor-invitations';
import { setTokens } from '@/lib/api/client';
import { getStoreIdFromToken } from '@/lib/jwt';
import { queryKeys } from '@/lib/react-query/keys';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
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
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<LoginResult, Error, { token: string; password: string; fullName: string }>({
    mutationFn: acceptVendorInvitation,
    onSuccess: (result) => {
      setTokens(result.accessToken, result.refreshToken);
      const storeId = getStoreIdFromToken(result.accessToken);
      setUser({ ...result.user, storeId });
      if (storeId) {
        useVendorStore.getState().setActiveStoreId(storeId);
      }
    },
  });
}
