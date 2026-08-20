import { defineConfig, devices } from '@playwright/test';

const PORT = 3001;
const baseURL = `http://localhost:${PORT}`;

/** Shared with e2e/fixtures/taxonomy/admin-auth.ts — edge proxy verifies HS256 + iss/aud. */
const E2E_JWT_SECRET =
  process.env.JWT_SECRET?.trim() || 'sopet-admin-e2e-jwt-secret-min-32-chars!!';
const E2E_JWT_ISSUER = process.env.JWT_ISSUER?.trim() || 'sopet';
const E2E_JWT_AUDIENCE = process.env.JWT_AUDIENCE?.trim() || 'sopet-api';

process.env.JWT_SECRET = E2E_JWT_SECRET;
process.env.JWT_ISSUER = E2E_JWT_ISSUER;
process.env.JWT_AUDIENCE = E2E_JWT_AUDIENCE;

export default defineConfig({
  testDir: './e2e',
  // Playwright defaults also match `*.test.ts`; those are Vitest shape checks under fixtures/.
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'yarn start' : 'yarn dev',
    url: baseURL,
    // Avoid mismatched JWT_SECRET when a pre-existing dev server was started without e2e env.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      JWT_SECRET: E2E_JWT_SECRET,
      JWT_ISSUER: E2E_JWT_ISSUER,
      JWT_AUDIENCE: E2E_JWT_AUDIENCE,
    },
  },
});
