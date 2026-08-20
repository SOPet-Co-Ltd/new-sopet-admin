import { NextResponse } from 'next/server';
import { getAccessTokenFromRequest, isAuthenticatedFromCookies } from '@/lib/auth/bff-cookies';
import {
  getMustChangePasswordFromVerifiedToken,
  getPortalRoleFromVerifiedToken,
  getStoreIdFromVerifiedToken,
} from '@/lib/jwt';

export async function GET() {
  const authenticated = await isAuthenticatedFromCookies();
  if (!authenticated) {
    return NextResponse.json({ authenticated: false });
  }

  const accessToken = await getAccessTokenFromRequest();
  const role = await getPortalRoleFromVerifiedToken(accessToken);
  const storeId = await getStoreIdFromVerifiedToken(accessToken);
  const mustChangePassword = await getMustChangePasswordFromVerifiedToken(accessToken);

  return NextResponse.json({
    authenticated: true,
    role,
    storeId: storeId ?? null,
    mustChangePassword,
  });
}
