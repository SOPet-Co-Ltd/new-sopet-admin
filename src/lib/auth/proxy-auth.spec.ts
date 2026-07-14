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

  it('redirects vendor hitting admin routes to vendor home', () => {
    const token = createFakeJwt({ role: 'vendor' });
    expect(getAuthRedirectPath('/admin/stores', 'vendor', token)).toBe('/vendor');
  });

  it('redirects admin hitting vendor routes to admin stores', () => {
    const token = createFakeJwt({ role: 'admin' });
    expect(getAuthRedirectPath('/vendor', 'admin', token)).toBe('/admin/stores');
  });

  it('redirects unrecognized roles to login', () => {
    const token = createFakeJwt({ role: 'customer' });
    expect(getAuthRedirectPath('/admin/stores', null, token)).toBe('/login');
  });

  it('allows matching admin role through admin routes', () => {
    const token = createFakeJwt({ role: 'admin' });
    expect(getAuthRedirectPath('/admin/stores', 'admin', token)).toBeNull();
  });

  it('allows matching vendor role through vendor routes', () => {
    const token = createFakeJwt({ role: 'vendor' });
    expect(getAuthRedirectPath('/vendor/products', 'vendor', token)).toBeNull();
  });

  it('redirects authenticated users away from register', () => {
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
    expect(getGuestOnlyRedirectPath('/register', null, 'token')).toBeNull();
  });

  it('ignores non-register routes for guest-only redirect', () => {
    const token = createFakeJwt({ role: 'vendor' });
    expect(getGuestOnlyRedirectPath('/login', 'vendor', token)).toBeNull();
  });
});
