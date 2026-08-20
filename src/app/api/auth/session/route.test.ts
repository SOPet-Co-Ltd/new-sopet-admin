import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAccessTokenFromRequest = vi.fn();
const isAuthenticatedFromCookies = vi.fn();
const getPortalRoleFromVerifiedToken = vi.fn();
const getStoreIdFromVerifiedToken = vi.fn();
const getMustChangePasswordFromVerifiedToken = vi.fn();

vi.mock('@/lib/auth/bff-cookies', () => ({
  getAccessTokenFromRequest: (...args: unknown[]) => getAccessTokenFromRequest(...args),
  isAuthenticatedFromCookies: (...args: unknown[]) => isAuthenticatedFromCookies(...args),
}));

vi.mock('@/lib/jwt', () => ({
  getPortalRoleFromVerifiedToken: (...args: unknown[]) => getPortalRoleFromVerifiedToken(...args),
  getStoreIdFromVerifiedToken: (...args: unknown[]) => getStoreIdFromVerifiedToken(...args),
  getMustChangePasswordFromVerifiedToken: (...args: unknown[]) =>
    getMustChangePasswordFromVerifiedToken(...args),
}));

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthenticated when cookies are missing', async () => {
    isAuthenticatedFromCookies.mockResolvedValue(false);
    const { GET } = await import('./route');
    const response = await GET();
    expect(await response.json()).toEqual({ authenticated: false });
  });

  it('exposes mustChangePassword from the verified JWT claim', async () => {
    isAuthenticatedFromCookies.mockResolvedValue(true);
    getAccessTokenFromRequest.mockResolvedValue('token');
    getPortalRoleFromVerifiedToken.mockResolvedValue('admin');
    getStoreIdFromVerifiedToken.mockResolvedValue(undefined);
    getMustChangePasswordFromVerifiedToken.mockResolvedValue(true);

    const { GET } = await import('./route');
    const response = await GET();
    expect(await response.json()).toEqual({
      authenticated: true,
      role: 'admin',
      storeId: null,
      mustChangePassword: true,
    });
  });
});
