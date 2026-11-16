import { AUTH_COMPANION_COOKIE } from '@/lib/config';
import { hasAuthCompanionCookie, logoutViaBff, refreshViaBff } from '@/lib/auth/client-session';

type AuthFailureHandler = (message?: string) => void;

let onAuthFailure: AuthFailureHandler = () => {
  void clearTokens();
};

/**
 * Logout responses clear cookies when they arrive. A slow logout that was
 * started before login, or one fired while login is in flight, must not run
 * after the new session cookies are set.
 */
let authEpoch = 0;
let authChain: Promise<unknown> = Promise.resolve();

function enqueueAuthTask<T>(task: () => Promise<T>): Promise<T> {
  const run = authChain.then(task, task);
  authChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** Runs `task` so any logout requested before it finishes is dropped. */
export function runExclusiveAuth<T>(task: () => Promise<T>): Promise<T> {
  authEpoch += 1;
  const ticket = authEpoch;
  return enqueueAuthTask(async () => {
    try {
      return await task();
    } finally {
      if (authEpoch === ticket) {
        authEpoch += 1;
      }
    }
  });
}

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

export function clearTokens(): Promise<void> {
  const ticket = authEpoch;
  return enqueueAuthTask(async () => {
    if (ticket !== authEpoch) {
      return;
    }
    clearCompanionCookie();
    try {
      await logoutViaBff();
    } catch {
      // Best-effort
    }
  });
}

export function hasClientSession(): boolean {
  return hasAuthCompanionCookie();
}

export function setOnAuthFailure(handler: AuthFailureHandler): void {
  onAuthFailure = handler;
}

export function notifyAuthFailure(message?: string): void {
  void clearTokens();
  if (typeof window !== 'undefined') {
    onAuthFailure(message);
  }
}

export { refreshViaBff };
