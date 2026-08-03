'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptAdminInvitation,
  getAdminInvitationByToken,
  getAdminTeamMembers,
  getPendingAdminInvitations,
  inviteAdmin,
  revokeAdminInvitation,
  setAdminActive,
} from '@/lib/api/adminTeam';
import { applyAuthenticatedSession } from '@/lib/auth/apply-session';
import { queryKeys } from '@/lib/react-query/keys';
import type { InviteAdminInput, LoginResult } from '@/types';

export function useAdminTeamMembers() {
  return useQuery({
    queryKey: queryKeys.adminTeam.members(),
    queryFn: getAdminTeamMembers,
  });
}

export function usePendingAdminInvitations() {
  return useQuery({
    queryKey: queryKeys.adminTeam.invitations(),
    queryFn: getPendingAdminInvitations,
  });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteAdminInput) => inviteAdmin(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTeam.all });
    },
  });
}

export function useRevokeAdminInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => revokeAdminInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTeam.invitations() });
    },
  });
}

export function useSetAdminActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setAdminActive(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTeam.members() });
    },
  });
}

export function useAdminInvitationByToken(token: string) {
  return useQuery({
    queryKey: queryKeys.adminTeam.invitationByToken(token),
    queryFn: () => getAdminInvitationByToken(token),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptAdminInvitation() {
  return useMutation<LoginResult, Error, { token: string; password: string; fullName: string }>({
    mutationFn: acceptAdminInvitation,
    onSuccess: async (result) => {
      await applyAuthenticatedSession(result.user);
    },
  });
}
