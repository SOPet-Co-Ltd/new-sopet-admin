import type { Page } from '@playwright/test';
import { adminUser } from './data';

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN = 'e2e-refresh-token';

type AuthRole = 'admin' | 'vendor';

function createFakeJwt(role: AuthRole): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ role })).toString('base64url');
  return `${header}.${body}.e2e-signature`;
}

async function seedAuthCookies(page: Page, role: AuthRole) {
  await page.context().addCookies([
    {
      name: ACCESS_TOKEN_COOKIE,
      value: createFakeJwt(role),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
    {
      name: REFRESH_TOKEN_COOKIE,
      value: REFRESH_TOKEN,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
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
