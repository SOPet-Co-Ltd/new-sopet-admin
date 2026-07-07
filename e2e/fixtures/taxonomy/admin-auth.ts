import type { Page } from '@playwright/test';
import { adminUser } from './data';

const ACCESS_TOKEN = 'e2e-access-token';
const REFRESH_TOKEN = 'e2e-refresh-token';

export async function authenticateAsAdmin(page: Page) {
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: ACCESS_TOKEN,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
    {
      name: 'refreshToken',
      value: REFRESH_TOKEN,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
  ]);

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
