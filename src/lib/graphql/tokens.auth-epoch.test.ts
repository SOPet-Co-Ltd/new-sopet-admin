import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logoutViaBff } from '@/lib/auth/client-session';
import { clearTokens, runExclusiveAuth } from '@/lib/graphql/tokens';

vi.mock('@/lib/auth/client-session', () => ({
  hasAuthCompanionCookie: () => false,
  logoutViaBff: vi.fn(),
  refreshViaBff: vi.fn(),
}));

describe('auth cookie epoch', () => {
  beforeEach(() => {
    vi.mocked(logoutViaBff).mockReset();
  });

  it('drops a logout that starts while sign-in is still finishing', async () => {
    let releaseFirstLogout: () => void = () => undefined;
    const firstLogout = new Promise<void>((resolve) => {
      releaseFirstLogout = resolve;
    });
    let logoutCalls = 0;
    vi.mocked(logoutViaBff).mockImplementation(() => {
      logoutCalls += 1;
      if (logoutCalls === 1) {
        return firstLogout;
      }
      return Promise.resolve();
    });

    const firstClear = clearTokens();
    await vi.waitFor(() => expect(logoutCalls).toBe(1));

    let logoutDuringLogin: Promise<void> = Promise.resolve();
    const login = runExclusiveAuth(async () => {
      logoutDuringLogin = clearTokens();
      return 'signed-in';
    });

    releaseFirstLogout();

    await expect(login).resolves.toBe('signed-in');
    await logoutDuringLogin;
    await firstClear;

    expect(logoutCalls).toBe(1);
  });
});
