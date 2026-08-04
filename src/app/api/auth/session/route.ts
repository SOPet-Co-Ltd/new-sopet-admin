import { NextResponse } from 'next/server';
import { getAccessTokenFromRequest, isAuthenticatedFromCookies } from '@/lib/auth/bff-cookies';
import { decodeJwtPayload, getPortalRoleFromToken } from '@/lib/jwt';

export async function GET() {
  const authenticated = await isAuthenticatedFromCookies();
  if (!authenticated) {
    return NextResponse.json({ authenticated: false });
  }

  const accessToken = await getAccessTokenFromRequest();
  const role = getPortalRoleFromToken(accessToken);
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const storeId = typeof payload?.storeId === 'string' ? payload.storeId : null;

  return NextResponse.json({
    authenticated: true,
    role,
    storeId,
  });
}
