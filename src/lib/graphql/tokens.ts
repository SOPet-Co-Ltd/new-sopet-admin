import { AUTH_COMPANION_COOKIE } from '@/lib/config';
import { hasAuthCompanionCookie, logoutViaBff, refreshViaBff } from '@/lib/auth/client-session';

type AuthFailureHandler = (message?: string) => void;

let onAuthFailure: AuthFailureHandler = () => {
  void clearTokens();
};

/** HttpOnly — not readable from JS. Prefer hasClientSession(). */
export function getAccessToken(): string | undefined {
  return undefined;
}

/** HttpOnly — not readable from JS. */
export function getRefreshToken(): string | undefined {
  return undefined;
}

/** No-op — BFF `/graphql` proxy harvests tokens into HttpOnly cookies. */
export function setTokens(_access: string, _refresh: string): void {
  void _access;
  void _refresh;
}

function clearCompanionCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${AUTH_COMPANION_COOKIE}=; max-age=0; path=/; SameSite=Lax`;
  document.cookie = `__Host-${AUTH_COMPANION_COOKIE}=; max-age=0; path=/; Secure; SameSite=Lax`;
}

export async function clearTokens(): Promise<void> {
  clearCompanionCookie();
  try {
    await logoutViaBff();
  } catch {
    // Best-effort
  }
}

export function hasClientSession(): boolean {
  return hasAuthCompanionCookie();
}

export function setOnAuthFailure(handler: AuthFailureHandler): void {
  onAuthFailure = handler;
}

export function notifyAuthFailure(message?: string): void {
  clearCompanionCookie();
  void logoutViaBff();
  if (typeof window !== 'undefined') {
    onAuthFailure(message);
  }
}

export { refreshViaBff };
