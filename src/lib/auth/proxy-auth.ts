import { ACCESS_TOKEN } from '@/lib/config';
import { getPortalRoleFromToken } from '@/lib/jwt';

export type AuthRole = 'admin' | 'vendor';

/**
 * Decode-only UX helper — never use for authorization (SOPET-M-13).
 * Prefer cookie presence + AuthGuard / GraphQL for access control.
 */
export function getRoleFromAccessToken(token: string | undefined): AuthRole | null {
  return getPortalRoleFromToken(token);
}

export function getDashboardPathForRole(role: AuthRole): string {
  if (role === 'admin') return '/admin/stores';
  return '/vendor';
}

/**
 * Guest-only routes: cookie presence is enough to bounce away from register.
 * Destination uses decode for UX only; AuthGuard enforces role on arrival.
 */
export function getGuestOnlyRedirectPath(
  pathname: string,
  role: AuthRole | null,
  accessToken?: string,
): string | null {
  const isGuestOnlyRoute = pathname === '/register' || pathname.startsWith('/register/');
  if (!isGuestOnlyRoute || !accessToken) {
    return null;
  }

  if (role === 'admin' || role === 'vendor') {
    return getDashboardPathForRole(role);
  }

  // Cookie present but role unknown — send to login, which routes after session check.
  return '/login';
}

/** Public LLM / crawler docs — must stay readable without a vendor session. */
export function isPublicVendorApiDocPath(pathname: string): boolean {
  return pathname === '/vendor/api/llms.txt';
}

/** Public error-code catalog pages (noindex) under admin/vendor prefixes. */
export function isPublicErrorsMessagePath(pathname: string): boolean {
  return pathname === '/admin/errors-message' || pathname === '/vendor/errors-message';
}

/**
 * Edge gate: cookie presence only. Do not authorize admin vs vendor from an
 * unsigned JWT payload (SOPET-M-13). Role mismatch is enforced by AuthGuard.
 */
export function getAuthRedirectPath(
  pathname: string,
  _role: AuthRole | null,
  accessToken?: string,
): string | null {
  if (isPublicVendorApiDocPath(pathname) || isPublicErrorsMessagePath(pathname)) {
    return null;
  }

  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/vendor');
  if (!isProtectedRoute) {
    return null;
  }

  if (!accessToken) {
    return '/login';
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
    if (name === ACCESS_TOKEN || name === `__Host-${ACCESS_TOKEN}`) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return undefined;
}
