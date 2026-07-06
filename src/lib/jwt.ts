import { getAccessToken } from '@/lib/graphql/tokens';

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

export function getStoreIdFromToken(token?: string): string | undefined {
  const accessToken = token ?? getAccessToken();
  if (!accessToken) return undefined;
  const payload = decodeJwtPayload(accessToken);
  return typeof payload?.storeId === 'string' ? payload.storeId : undefined;
}
