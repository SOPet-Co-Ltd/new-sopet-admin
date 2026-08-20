import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN } from '@/lib/config';
import {
  getAuthRedirectPath,
  getGuestOnlyRedirectPath,
  getVerifiedRequestRole,
} from '@/lib/auth/proxy-auth';
import { getMustChangePasswordFromVerifiedToken } from '@/lib/jwt';

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  const role = await getVerifiedRequestRole(accessToken);
  const mustChangePassword = await getMustChangePasswordFromVerifiedToken(accessToken);
  const redirectPath =
    getAuthRedirectPath(request.nextUrl.pathname, role, accessToken, mustChangePassword) ??
    getGuestOnlyRedirectPath(request.nextUrl.pathname, role, accessToken);

  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vendor/:path*', '/register', '/register/:path*'],
};
