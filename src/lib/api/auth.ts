import { executeMutation, executeQuery } from '@/lib/graphql/client';
import { ME_QUERY, REFRESH_TOKEN, REGISTER_VENDOR, VENDOR_LOGIN } from '@/lib/graphql/documents';
import { mapUser } from '@/lib/graphql/mappers';
import type { LoginInput, LoginResult, RefreshResult, RegisterVendorInput, User } from '@/types';

type AuthPayload = {
  tokens: { accessToken: string; refreshToken: string };
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    emailVerified?: boolean;
    profilePhotoUrl?: string | null;
  };
};

function mapLoginResult(payload: AuthPayload): LoginResult {
  return {
    accessToken: payload.tokens.accessToken,
    refreshToken: payload.tokens.refreshToken,
    user: mapUser(payload.user),
  };
}

export function login(input: LoginInput): Promise<LoginResult> {
  return executeMutation<{ vendorLogin: AuthPayload }>(VENDOR_LOGIN, { input }).then((data) =>
    mapLoginResult(data.vendorLogin),
  );
}

/** @deprecated Use login() — role is returned from the API. */
export const vendorLogin = login;

/** @deprecated Use login() — role is returned from the API. */
export const adminLogin = login;

export function refresh(refreshToken: string): Promise<RefreshResult> {
  return executeMutation<{
    refreshToken: { accessToken: string; refreshToken: string };
  }>(REFRESH_TOKEN, { input: { refreshToken } }).then((data) => data.refreshToken);
}

export function registerVendor(input: RegisterVendorInput): Promise<LoginResult> {
  return executeMutation<{ registerVendor: AuthPayload }>(REGISTER_VENDOR, { input }).then((data) =>
    mapLoginResult(data.registerVendor),
  );
}

type MeQueryResult = {
  me: {
    user?: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      storeId?: string | null;
      profilePhotoUrl?: string | null;
      emailVerified?: boolean;
    } | null;
  };
};

export function getMe(): Promise<User> {
  return executeQuery<MeQueryResult>(ME_QUERY, undefined, { fetchPolicy: 'network-only' }).then(
    (data) => {
      const gqlUser = data.me.user;
      if (!gqlUser) {
        throw new Error('User profile not found');
      }
      return mapUser(gqlUser, gqlUser.storeId ?? undefined);
    },
  );
}
