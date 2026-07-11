# Coding Conventions (Admin)

## TypeScript

- `strict: true`
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

Husky pre-commit → lint-staged → Prettier on staged files.

## ESLint

`eslint.config.mjs` — next core-web-vitals + typescript + prettier.

```bash
yarn lint
```

## Testing

### Vitest (unit, integration, fixture-e2e)

```bash
yarn test
yarn test:coverage
```

**File naming (colocated):**

| Lane              | Pattern                    | Example                             |
| ----------------- | -------------------------- | ----------------------------------- |
| Unit / component  | `*.test.ts(x)`             | `vendor-reply-form.test.tsx`        |
| Integration       | `*.int.test.ts(x)`         | `query-stale-time.int.test.tsx`     |
| Fixture E2E (RTL) | `*.fixture.e2e.test.ts(x)` | `vendor-reply.fixture.e2e.test.tsx` |

Skeleton files (`*.skeleton.ts(x)`) hold AC proof obligations from design docs. Implement the target file named in the skeleton header, then delete the skeleton.

### Playwright (browser E2E)

```bash
yarn test:e2e
yarn test:e2e:ui
```

**File naming:** `e2e/*.fixture.e2e.spec.ts` for multi-step admin journeys; reuse `e2e/fixtures/taxonomy/admin-auth.ts` and GraphQL route mocks.

Base URL: `http://localhost:3001`. Auto-starts `yarn dev`.

## CI

`.github/workflows/ci.yml`:

```
format:check → type-check → test → build → playwright
```

## Package manager

Yarn only.

## Related docs

- [Development guide](development-guide.md)
- [Feature development](feature-development.md)
