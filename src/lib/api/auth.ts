import { executeMutation } from '@/lib/graphql/client';
import { REFRESH_TOKEN, REGISTER_VENDOR, VENDOR_LOGIN } from '@/lib/graphql/documents';
import { mapUser } from '@/lib/graphql/mappers';
import type { LoginInput, LoginResult, RefreshResult, RegisterVendorInput } from '@/types';

type AuthPayload = {
  tokens: { accessToken: string; refreshToken: string };
  user: { id: string; email: string; fullName: string; role: string };
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
