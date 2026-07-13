import { ACCESS_TOKEN } from '@/lib/config';
import { getPortalRoleFromToken } from '@/lib/jwt';

export type AuthRole = 'admin' | 'vendor';

export function getRoleFromAccessToken(token: string | undefined): AuthRole | null {
  return getPortalRoleFromToken(token);
}

export function getDashboardPathForRole(role: AuthRole): string {
  if (role === 'admin') return '/admin/stores';
  return '/vendor';
}

export function getGuestOnlyRedirectPath(
  pathname: string,
  role: AuthRole | null,
  accessToken?: string,
): string | null {
  const isGuestOnlyRoute = pathname === '/register' || pathname.startsWith('/register/');
  if (!isGuestOnlyRoute || !accessToken || !role) {
    return null;
  }

  return getDashboardPathForRole(role);
}

export function getAuthRedirectPath(
  pathname: string,
  role: AuthRole | null,
  accessToken?: string,
): string | null {
  if (!accessToken || !role) {
    return '/login';
  }

  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return role === 'vendor' ? '/vendor' : '/login';
    }
    return null;
  }

  if (pathname.startsWith('/vendor')) {
    if (role !== 'vendor') {
      return role === 'admin' ? '/admin/stores' : '/login';
    }
    return null;
  }

  return null;
}

export function getRequestRole(accessToken: string | undefined): AuthRole | null {
  return getRoleFromAccessToken(accessToken);
}

export function getAccessTokenFromCookieHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(';')) {
    const [name, ...valueParts] = part.trim().split('=');
    if (name === ACCESS_TOKEN) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return undefined;
}
