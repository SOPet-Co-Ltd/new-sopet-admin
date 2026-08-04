import { AUTH_COMPANION_COOKIE } from '@/lib/config';
import type { PortalRole } from '@/lib/jwt';

export type AuthSession = {
  authenticated: boolean;
  role?: PortalRole | null;
  storeId?: string | null;
};

export function hasAuthCompanionCookie(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  const prefix = `${AUTH_COMPANION_COOKIE}=`;
  return document.cookie.split('; ').some((entry) => entry.startsWith(prefix));
}

export async function fetchAuthSession(): Promise<AuthSession> {
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    return { authenticated: false };
  }
  return (await response.json()) as AuthSession;
}

export async function logoutViaBff(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function refreshViaBff(): Promise<boolean> {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return response.ok;
}
