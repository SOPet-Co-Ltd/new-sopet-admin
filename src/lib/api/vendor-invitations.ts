import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ACCEPT_VENDOR_INVITATION,
  INVITE_VENDOR,
  PENDING_VENDOR_INVITATIONS_QUERY,
} from '@/lib/graphql/documents';
import { mapUser, mapVendorInvitation } from '@/lib/graphql/mappers';
import type { InviteVendorInput, LoginResult, VendorInvitation } from '@/types';

type GqlVendorInvitation = Parameters<typeof mapVendorInvitation>[0];

export function getPendingVendorInvitations(): Promise<VendorInvitation[]> {
  return executeQuery<{ pendingVendorInvitations: GqlVendorInvitation[] }>(
    PENDING_VENDOR_INVITATIONS_QUERY,
  ).then((data) => data.pendingVendorInvitations.map(mapVendorInvitation));
}

export function inviteVendor(input: InviteVendorInput): Promise<VendorInvitation> {
  return executeMutation<{ inviteVendor: GqlVendorInvitation }>(INVITE_VENDOR, {
    input,
  }).then((data) => mapVendorInvitation(data.inviteVendor));
}

export function acceptVendorInvitation(input: {
  token: string;
  password: string;
  fullName: string;
}): Promise<LoginResult> {
  return executeMutation<{
    acceptVendorInvitation: {
      tokens: { accessToken: string; refreshToken: string };
      user: Parameters<typeof mapUser>[0];
    };
  }>(ACCEPT_VENDOR_INVITATION, { input }).then((data) => ({
    accessToken: data.acceptVendorInvitation.tokens.accessToken,
    refreshToken: data.acceptVendorInvitation.tokens.refreshToken,
    user: mapUser(data.acceptVendorInvitation.user),
  }));
}
