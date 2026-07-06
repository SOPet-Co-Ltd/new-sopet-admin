'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminTeamMembers,
  getPendingAdminInvitations,
  inviteAdmin,
  revokeAdminInvitation,
  setAdminActive,
} from '@/lib/api/adminTeam';
import { queryKeys } from '@/lib/react-query/keys';
import type { InviteAdminInput } from '@/types';

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
