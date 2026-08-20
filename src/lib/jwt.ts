import { jwtVerify, type JWTPayload } from 'jose';

export type PortalRole = 'admin' | 'vendor';

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

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

export async function verifyJwtPayload(token: string): Promise<JWTPayload | null> {
  const secret = getJwtSecret();
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpiredFromPayload(payload: Record<string, unknown> | JWTPayload): boolean {
  const exp = payload.exp;
  if (typeof exp !== 'number') return false;
  return exp * 1000 <= Date.now();
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  return isTokenExpiredFromPayload(payload);
}

export function getPortalRoleFromPayload(
  payload: Record<string, unknown> | JWTPayload | null | undefined,
): PortalRole | null {
  if (!payload || isTokenExpiredFromPayload(payload as Record<string, unknown>)) {
    return null;
  }

  const role = payload.role;
  if (role === 'admin' || role === 'vendor') {
    return role;
  }

  return null;
}

export function getPortalRoleFromToken(token: string | undefined): PortalRole | null {
  if (!token || isTokenExpired(token)) return null;
  return getPortalRoleFromPayload(decodeJwtPayload(token));
}

export async function getPortalRoleFromVerifiedToken(
  token: string | undefined,
): Promise<PortalRole | null> {
  if (!token) {
    return null;
  }

  const payload = await verifyJwtPayload(token);
  return getPortalRoleFromPayload(payload);
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

export async function getStoreIdFromVerifiedToken(token?: string): Promise<string | undefined> {
  if (!token) return undefined;
  const payload = await verifyJwtPayload(token);
  return typeof payload?.storeId === 'string' ? payload.storeId : undefined;
}

export function getMustChangePasswordFromPayload(
  payload: Record<string, unknown> | JWTPayload | null | undefined,
): boolean {
  if (!payload) return false;
  return payload.mustChangePassword === true;
}

export async function getMustChangePasswordFromVerifiedToken(token?: string): Promise<boolean> {
  if (!token) return false;
  const payload = await verifyJwtPayload(token);
  return getMustChangePasswordFromPayload(payload);
}
