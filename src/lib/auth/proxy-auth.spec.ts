import { describe, expect, it } from 'vitest';
import {
  getAuthRedirectPath,
  getGuestOnlyRedirectPath,
  getRoleFromAccessToken,
} from '@/lib/auth/proxy-auth';

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('proxy-auth', () => {
  it('returns null role for malformed tokens', () => {
    expect(getRoleFromAccessToken('not-a-jwt')).toBeNull();
  });

  it('returns null role for expired tokens', () => {
    const token = createFakeJwt({ role: 'admin', exp: Math.floor(Date.now() / 1000) - 60 });
    expect(getRoleFromAccessToken(token)).toBeNull();
  });

  it('redirects unauthenticated admin requests to login', () => {
    expect(getAuthRedirectPath('/admin/stores', null, undefined)).toBe('/login');
  });

  it('does not authorize admin vs vendor from unsigned JWT at the edge (SOPET-M-13)', () => {
    const vendorToken = createFakeJwt({ role: 'vendor' });
    const adminToken = createFakeJwt({ role: 'admin' });
    // Cookie presence alone allows the HTML shell through; AuthGuard enforces role.
    expect(getAuthRedirectPath('/admin/stores', 'vendor', vendorToken)).toBeNull();
    expect(getAuthRedirectPath('/vendor', 'admin', adminToken)).toBeNull();
  });

  it('allows matching roles through protected routes when cookie is present', () => {
    const token = createFakeJwt({ role: 'admin' });
    expect(getAuthRedirectPath('/admin/stores', 'admin', token)).toBeNull();
  });

  it('allows unauthenticated access to vendor API llms.txt', () => {
    expect(getAuthRedirectPath('/vendor/api/llms.txt', null, undefined)).toBeNull();
  });

  it('allows unauthenticated access to public error catalog pages', () => {
    expect(getAuthRedirectPath('/admin/errors-message', null, undefined)).toBeNull();
    expect(getAuthRedirectPath('/vendor/errors-message', null, undefined)).toBeNull();
  });

  it('still protects other vendor API pages without a cookie', () => {
    expect(getAuthRedirectPath('/vendor/api', null, undefined)).toBe('/login');
    expect(getAuthRedirectPath('/vendor/api/docs', null, undefined)).toBe('/login');
  });

  it('still protects other admin and vendor dashboard pages without a cookie', () => {
    expect(getAuthRedirectPath('/admin/stores', null, undefined)).toBe('/login');
    expect(getAuthRedirectPath('/vendor/products', null, undefined)).toBe('/login');
  });

  it('redirects authenticated users away from register (UX decode for destination)', () => {
    const vendorToken = createFakeJwt({ role: 'vendor' });
    expect(getGuestOnlyRedirectPath('/register', 'vendor', vendorToken)).toBe('/vendor');

    const adminToken = createFakeJwt({ role: 'admin' });
    expect(getGuestOnlyRedirectPath('/register', 'admin', adminToken)).toBe('/admin/stores');
    expect(getGuestOnlyRedirectPath('/register/invite', 'vendor', vendorToken)).toBe('/vendor');
  });

  it('allows unauthenticated users to access register', () => {
    expect(getAuthRedirectPath('/register', null, undefined)).toBeNull();
    expect(getAuthRedirectPath('/register/invite', null, undefined)).toBeNull();
    expect(getGuestOnlyRedirectPath('/register', null, undefined)).toBeNull();
    expect(getGuestOnlyRedirectPath('/register', null, undefined)).toBeNull();
  });

  it('bounces register visitors with a cookie but unknown role to login', () => {
    expect(getGuestOnlyRedirectPath('/register', null, 'opaque-cookie-value')).toBe('/login');
  });

  it('ignores non-register routes for guest-only redirect', () => {
    const token = createFakeJwt({ role: 'vendor' });
    expect(getGuestOnlyRedirectPath('/login', 'vendor', token)).toBeNull();
  });
});
