import type { Page } from '@playwright/test';
import { SignJWT } from 'jose';
import { adminUser } from './data';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN = 'e2e-refresh-token';

/** Must match `playwright.config.ts` webServer env / CI JWT_SECRET. */
export const E2E_JWT_SECRET =
  process.env.JWT_SECRET?.trim() || 'sopet-admin-e2e-jwt-secret-min-32-chars!!';

type AuthRole = 'admin' | 'vendor';

async function createSignedJwt(role: AuthRole): Promise<string> {
  const secret = new TextEncoder().encode(E2E_JWT_SECRET);
  return new SignJWT({ role, sub: `${role}-e2e-1` })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(process.env.JWT_ISSUER?.trim() || 'sopet')
    .setAudience(process.env.JWT_AUDIENCE?.trim() || 'sopet-api')
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
}

async function seedAuthCookies(page: Page, role: AuthRole) {
  const accessToken = await createSignedJwt(role);
  await page.context().addCookies([
    {
      name: ACCESS_TOKEN_COOKIE,
      value: accessToken,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
      httpOnly: true,
    },
    {
      name: REFRESH_TOKEN_COOKIE,
      value: REFRESH_TOKEN,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
      httpOnly: true,
    },
    {
      name: 'sopet_admin_auth',
      value: '1',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
      httpOnly: false,
    },
  ]);
}

export async function authenticateAsAdmin(page: Page) {
  await seedAuthCookies(page, 'admin');

  await page.addInitScript((user) => {
    window.localStorage.setItem(
      'sopet-admin-auth',
      JSON.stringify({
        state: {
          user,
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
  }, adminUser);
}

export async function authenticateAsVendor(page: Page) {
  await seedAuthCookies(page, 'vendor');

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'sopet-admin-auth',
      JSON.stringify({
        state: {
          user: {
            id: 'vendor-e2e-1',
            email: 'vendor-e2e@sopet.test',
            fullName: 'E2E Vendor',
            role: 'vendor',
          },
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
  });
}

export function createMalformedAccessToken(): string {
  return 'not-a-jwt-token';
}
