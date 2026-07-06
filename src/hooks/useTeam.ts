'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acceptStoreInvitation,
  getStoreInvitations,
  getStoreMembers,
  inviteStoreMember,
  removeStoreMember,
  revokeStoreInvitation,
  updateStoreMemberRole,
} from '@/lib/api/team';
import { queryKeys } from '@/lib/react-query/keys';
import type { InviteStoreMemberInput } from '@/types';

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
