import { ACCESS_TOKEN } from '@/lib/config';
import { decodeJwtPayload } from '@/lib/jwt';

export type AuthRole = 'admin' | 'vendor';

export function getRoleFromAccessToken(token: string | undefined): AuthRole | null {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const role = payload?.role;

  if (role === 'admin' || role === 'vendor') {
    return role;
  }

  return null;
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
