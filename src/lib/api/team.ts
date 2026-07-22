import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ACCEPT_STORE_INVITATION,
  ACCEPT_STORE_MEMBER_INVITATION,
  DECLINE_STORE_INVITATION,
  GET_STORE_INVITATION_BY_TOKEN,
  INVITE_STORE_MEMBER,
  MY_PENDING_STORE_INVITATIONS_QUERY,
  REMOVE_STORE_MEMBER,
  REVOKE_STORE_INVITATION,
  STORE_INVITATIONS_QUERY,
  STORE_MEMBERS_QUERY,
  UPDATE_STORE_MEMBER_ROLE,
} from '@/lib/graphql/documents';
import { mapUser } from '@/lib/graphql/mappers';
import type {
  InviteStoreMemberInput,
  LoginResult,
  MyPendingStoreInvitation,
  StoreInvitationPreview,
  StoreMember,
  StoreMemberInvitation,
} from '@/types';

type GqlStoreMember = {
  id: string;
  storeId: string;
  userId: string;
  role: string;
  email?: string | null;
  fullName?: string | null;
};

type GqlStoreInvitation = {
  id: string;
  storeId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
};

type GqlMyPendingStoreInvitation = {
  id: string;
  storeId: string;
  storeName: string;
  role: string;
  status: string;
  expiresAt: string;
  token: string;
};

function mapStoreMember(member: GqlStoreMember): StoreMember {
  return {
    id: member.id,
    storeId: member.storeId,
    userId: member.userId,
    role: member.role,
    email: member.email ?? undefined,
    fullName: member.fullName ?? undefined,
  };
}

function mapStoreInvitation(invitation: GqlStoreInvitation): StoreMemberInvitation {
  return {
    id: invitation.id,
    storeId: invitation.storeId,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
  };
}

function mapMyPendingStoreInvitation(
  invitation: GqlMyPendingStoreInvitation,
): MyPendingStoreInvitation {
  return {
    id: invitation.id,
    storeId: invitation.storeId,
    storeName: invitation.storeName,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    token: invitation.token,
  };
}

export function getStoreMembers(): Promise<StoreMember[]> {
  return executeQuery<{ storeMembers: GqlStoreMember[] }>(STORE_MEMBERS_QUERY).then((data) =>
    data.storeMembers.map(mapStoreMember),
  );
}

export function getStoreInvitations(): Promise<StoreMemberInvitation[]> {
  return executeQuery<{ storeInvitations: GqlStoreInvitation[] }>(STORE_INVITATIONS_QUERY).then(
    (data) => data.storeInvitations.map(mapStoreInvitation),
  );
}

export function getMyPendingStoreInvitations(): Promise<MyPendingStoreInvitation[]> {
  return executeQuery<{ myPendingStoreInvitations: GqlMyPendingStoreInvitation[] }>(
    MY_PENDING_STORE_INVITATIONS_QUERY,
  ).then((data) => data.myPendingStoreInvitations.map(mapMyPendingStoreInvitation));
}

export function inviteStoreMember(input: InviteStoreMemberInput): Promise<StoreMemberInvitation> {
  return executeMutation<{ inviteStoreMember: GqlStoreInvitation }>(INVITE_STORE_MEMBER, {
    input,
  }).then((data) => mapStoreInvitation(data.inviteStoreMember));
}

export function updateStoreMemberRole(memberId: string, role: string): Promise<StoreMember> {
  return executeMutation<{ updateStoreMemberRole: GqlStoreMember }>(UPDATE_STORE_MEMBER_ROLE, {
    input: { memberId, role },
  }).then((data) => mapStoreMember(data.updateStoreMemberRole));
}

export function removeStoreMember(memberId: string): Promise<boolean> {
  return executeMutation<{ removeStoreMember: boolean }>(REMOVE_STORE_MEMBER, {
    memberId,
  }).then((data) => data.removeStoreMember);
}

export function revokeStoreInvitation(invitationId: string): Promise<StoreMemberInvitation> {
  return executeMutation<{ revokeStoreInvitation: GqlStoreInvitation }>(REVOKE_STORE_INVITATION, {
    invitationId,
  }).then((data) => mapStoreInvitation(data.revokeStoreInvitation));
}

export function acceptStoreInvitation(token: string): Promise<StoreMember> {
  return executeMutation<{ acceptStoreInvitation: GqlStoreMember }>(ACCEPT_STORE_INVITATION, {
    token,
  }).then((data) => mapStoreMember(data.acceptStoreInvitation));
}

export function declineStoreInvitation(token: string): Promise<boolean> {
  return executeMutation<{ declineStoreInvitation: boolean }>(DECLINE_STORE_INVITATION, {
    token,
  }).then((data) => data.declineStoreInvitation);
}

export function getStoreInvitationByToken(token: string): Promise<StoreInvitationPreview> {
  return executeQuery<{ getStoreInvitationByToken: StoreInvitationPreview }>(
    GET_STORE_INVITATION_BY_TOKEN,
    { token },
  ).then((data) => data.getStoreInvitationByToken);
}

export function acceptStoreMemberInvitation(input: {
  token: string;
  password: string;
  fullName: string;
}): Promise<LoginResult> {
  return executeMutation<{
    acceptStoreMemberInvitation: {
      tokens: { accessToken: string; refreshToken: string };
      user: Parameters<typeof mapUser>[0];
    };
  }>(ACCEPT_STORE_MEMBER_INVITATION, { input }).then((data) => ({
    accessToken: data.acceptStoreMemberInvitation.tokens.accessToken,
    refreshToken: data.acceptStoreMemberInvitation.tokens.refreshToken,
    user: mapUser(data.acceptStoreMemberInvitation.user),
  }));
}
