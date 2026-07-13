import { getAccessToken } from '@/lib/graphql/tokens';

export type PortalRole = 'admin' | 'vendor';

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;

  const exp = payload.exp;
  if (typeof exp !== 'number') return false;

  return exp * 1000 <= Date.now();
}

export function getPortalRoleFromToken(token: string | undefined): PortalRole | null {
  if (!token || isTokenExpired(token)) return null;

  const payload = decodeJwtPayload(token);
  const role = payload?.role;

  if (role === 'admin' || role === 'vendor') {
    return role;
  }

  return null;
}

export function isAccessTokenUsable(token?: string): token is string {
  return getPortalRoleFromToken(token) !== null;
}

export function getStoreIdFromToken(token?: string): string | undefined {
  const accessToken = token ?? getAccessToken();
  if (!accessToken) return undefined;
  const payload = decodeJwtPayload(accessToken);
  return typeof payload?.storeId === 'string' ? payload.storeId : undefined;
}
