export type PortalRole = 'admin' | 'vendor';

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
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

/** Prefer passing an explicit token (server) or storeId from `me` / session API. */
export function getStoreIdFromToken(token?: string): string | undefined {
  if (!token) return undefined;
  const payload = decodeJwtPayload(token);
  return typeof payload?.storeId === 'string' ? payload.storeId : undefined;
}
