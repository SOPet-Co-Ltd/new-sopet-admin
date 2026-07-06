import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_TEAM_MEMBERS_QUERY,
  INVITE_ADMIN,
  PENDING_ADMIN_INVITATIONS_QUERY,
  REVOKE_ADMIN_INVITATION,
  SET_ADMIN_ACTIVE,
} from '@/lib/graphql/documents';
import type { AdminInvitation, AdminTeamMember, InviteAdminInput } from '@/types';

export function getAdminTeamMembers(): Promise<AdminTeamMember[]> {
  return executeQuery<{ adminTeamMembers: AdminTeamMember[] }>(ADMIN_TEAM_MEMBERS_QUERY).then(
    (data) => data.adminTeamMembers,
  );
}

export function getPendingAdminInvitations(): Promise<AdminInvitation[]> {
  return executeQuery<{ pendingAdminInvitations: AdminInvitation[] }>(
    PENDING_ADMIN_INVITATIONS_QUERY,
  ).then((data) => data.pendingAdminInvitations);
}

export function inviteAdmin(input: InviteAdminInput): Promise<AdminInvitation> {
  return executeMutation<{ inviteAdmin: AdminInvitation }>(INVITE_ADMIN, { input }).then(
    (data) => data.inviteAdmin,
  );
}

export function revokeAdminInvitation(invitationId: string): Promise<AdminInvitation> {
  return executeMutation<{ revokeAdminInvitation: AdminInvitation }>(REVOKE_ADMIN_INVITATION, {
    invitationId,
  }).then((data) => data.revokeAdminInvitation);
}

export function setAdminActive(userId: string, isActive: boolean): Promise<AdminTeamMember> {
  return executeMutation<{ setAdminActive: AdminTeamMember }>(SET_ADMIN_ACTIVE, {
    userId,
    isActive,
  }).then((data) => data.setAdminActive);
}
