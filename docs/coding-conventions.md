# Coding Conventions (Admin)

## TypeScript

- `strict: true` (`tsconfig.json`)
- Path alias: `@/*` → `src/*`

## Naming

| Artifact          | Convention                               |
| ----------------- | ---------------------------------------- |
| Component files   | kebab-case (`vendor-order-workflow.tsx`) |
| Component exports | PascalCase                               |
| Hooks             | `use` + Domain (`useVendorOrders.ts`)    |
| API modules       | domain name (`orders.ts`, `taxonomy.ts`) |
| Zod schemas       | `*Schema` suffix                         |

## Formatting

Prettier (`.prettierrc`):

- Single quotes
- Semicolons
- Trailing commas
- Print width 100

```bash
yarn format
yarn format:check    # CI
```

Husky pre-commit → lint-staged → Prettier on staged `*.{ts,tsx,js,jsx,json,md,yml,yaml}`.

## ESLint

`eslint.config.mjs` — Next core-web-vitals + TypeScript + Prettier.

```bash
yarn lint
```

## Testing

### Vitest (unit, integration, fixture-e2e)

Runs files under `src/` matching `*.{test,spec}.{ts,tsx}` (`vitest.config.ts`). No MSW dependency — mock modules/hooks or harness fixtures as needed.

```bash
yarn test
yarn test:watch
yarn test:coverage
```

**File naming (colocated under `src/`):**

| Lane              | Pattern                    | Example                             |
| ----------------- | -------------------------- | ----------------------------------- |
| Unit / component  | `*.test.ts(x)`             | `vendor-reply-form.test.tsx`        |
| Also accepted     | `*.spec.ts(x)`             | `auth-guard.spec.tsx`               |
| Integration       | `*.int.test.ts(x)`         | `query-stale-time.int.test.tsx`     |
| Fixture E2E (RTL) | `*.fixture.e2e.test.ts(x)` | `vendor-reply.fixture.e2e.test.tsx` |

Skeleton files (`*.skeleton.ts(x)` / `e2e/*.skeleton.ts`) hold acceptance-criteria proof obligations from design docs. Implement the target file named in the skeleton header, then delete the skeleton.

### Playwright (browser E2E)

```bash
yarn test:e2e
yarn test:e2e:ui
```

| Pattern                     | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `e2e/*.spec.ts`             | Auth redirects, public pages, prefetch, etc. |
| `e2e/*.fixture.e2e.spec.ts` | Multi-step journeys with GraphQL route mocks |

Reuse `e2e/fixtures/taxonomy/admin-auth.ts` and `e2e/fixtures/graphql-route.ts` where applicable.

Base URL: `http://localhost:3001`. `playwright.config.ts` starts `yarn dev` locally, or `yarn start` in CI.

## CI

`.github/workflows/ci.yml` on PRs to `main` / `uat`:

```text
format:check → type-check → test → build → playwright (chromium)
```

CI checks out sibling backend schema into `sopet-backend/src/schema.gql` and sets `GRAPHQL_SCHEMA_PATH`.

## Package manager

Yarn only (`preinstall`: `only-allow yarn`). `packageManager`: `yarn@1.22.22`.

## Related docs

- [Development guide](development-guide.md)
- [Feature development](feature-development.md)
