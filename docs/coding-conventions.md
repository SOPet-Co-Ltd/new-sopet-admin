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

### Vitest

```bash
yarn test
yarn test:coverage
```

29 test files — unit, component, integration patterns.

### Playwright

```bash
yarn test:e2e
yarn test:e2e:ui
```

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
