'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptStoreInvitation,
  acceptStoreMemberInvitation,
  declineStoreInvitation,
  getMyPendingStoreInvitations,
  getStoreInvitationByToken,
  getStoreInvitations,
  getStoreMembers,
  inviteStoreMember,
  removeStoreMember,
  revokeStoreInvitation,
  updateStoreMemberRole,
} from '@/lib/api/team';
import { setTokens } from '@/lib/api/client';
import { getStoreIdFromToken } from '@/lib/jwt';
import { queryKeys } from '@/lib/react-query/keys';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import type { InviteStoreMemberInput, LoginResult } from '@/types';

export function useStoreMembers() {
  return useQuery({
    queryKey: queryKeys.team.members(),
    queryFn: getStoreMembers,
  });
}

export function useStoreInvitations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.team.invitations(),
    queryFn: getStoreInvitations,
    enabled,
  });
}

export function useMyPendingStoreInvitations() {
  return useQuery({
    queryKey: queryKeys.team.myPendingInvitations(),
    queryFn: getMyPendingStoreInvitations,
  });
}

export function useInviteStoreMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteStoreMemberInput) => inviteStoreMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useUpdateStoreMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      updateStoreMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    },
  });
}

export function useRemoveStoreMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeStoreMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.members() });
    },
  });
}

export function useRevokeStoreInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => revokeStoreInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.invitations() });
    },
  });
}

export function useAcceptStoreInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptStoreInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.myStores() });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useDeclineStoreInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => declineStoreInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.myPendingInvitations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}

export function useStoreInvitationPreview(token: string) {
  return useQuery({
    queryKey: queryKeys.team.invitationPreview(token),
    queryFn: () => getStoreInvitationByToken(token),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptStoreMemberInvitation() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation<LoginResult, Error, { token: string; password: string; fullName: string }>({
    mutationFn: acceptStoreMemberInvitation,
    onSuccess: (result) => {
      setTokens(result.accessToken, result.refreshToken);
      const storeId = getStoreIdFromToken(result.accessToken);
      setUser({ ...result.user, storeId });
      if (storeId) {
        useVendorStore.getState().setActiveStoreId(storeId);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.myStores() });
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
  });
}
