import { defineConfig } from 'vitest/config';

/** One-off Vitest config for Phase 0 fixture shape checks (e2e is excluded from default config). */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['e2e/fixtures/promotion-universal-conditions/**/*.shape.test.ts'],
  },
});
