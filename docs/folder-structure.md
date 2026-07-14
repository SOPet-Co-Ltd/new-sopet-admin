# Admin Folder Structure

Layout of the admin/vendor Next.js app as it exists under `src/`, plus root config and `e2e/`.

## Top-level `src/`

```text
src/
├── app/                 # Next.js App Router pages and layouts
├── components/          # UI: ui/, admin/, vendor/, shared domains
├── hooks/               # TanStack Query hooks (primary data layer)
├── lib/                 # API, GraphQL, validations, domain helpers
├── stores/              # Zustand (auth, vendor context)
├── types/               # Shared TypeScript types
├── test/                # Shared Vitest harness helpers
├── proxy.ts             # Next.js 16 request proxy (auth gate)
└── …
```

---

## `src/app/`

| Path               | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `page.tsx`         | `/` — client redirect by auth role (or to `/login`) |
| `layout.tsx`       | Root: fonts, `AppProviders`, `lang="th"`            |
| `login/`           | Email + password login                              |
| `register/`        | Vendor self-registration                            |
| `register/invite/` | Accept store-member invite (legacy/alternate entry) |
| `reset-password/`  | Password reset flow                                 |
| `verify-email/`    | Vendor email verification landing                   |
| `invite/store/`    | Token-based store team invite accept                |
| `admin/`           | Platform admin portal (`AuthGuard` role `admin`)    |
| `vendor/`          | Vendor portal (`AuthGuard` role `vendor`)           |
| `error.tsx`        | App error boundary                                  |
| `global-error.tsx` | Root error boundary                                 |
| `globals.css`      | Tailwind v4 + CSS variables                         |

**Portal layouts:**

| File                | Wraps                                              |
| ------------------- | -------------------------------------------------- |
| `admin/layout.tsx`  | `AdminLayout` + `AuthGuard requiredRole="admin"`   |
| `vendor/layout.tsx` | `VendorLayout` + `AuthGuard requiredRole="vendor"` |

Route inventory: [routing.md](routing.md).

---

## `src/components/`

| Folder / file           | Add when / purpose                                         |
| ----------------------- | ---------------------------------------------------------- |
| `ui/`                   | Shared primitives (button, dialog, data-table, inputs)     |
| `admin/`                | Platform-only UI (taxonomy, search admin, vendor tables)   |
| `vendor/`               | Store-scoped UI (orders, products, reviews, store request) |
| `promotions/`           | Shared promotion forms (admin + vendor)                    |
| `analytics/`            | Shared chart components                                    |
| `notifications/`        | Notification list cards                                    |
| `auth-guard.tsx`        | Client role/session gate                                   |
| `dashboard-shell.tsx`   | Shared sidebar shell, logout, theme toggle, nav prefetch   |
| `query-error-state.tsx` | Failed query/mutation UI                                   |
| `error-fallback.tsx`    | Route error UI                                             |
| `theme-toggle.tsx`      | Light/dark theme control                                   |

---

## `src/hooks/`

TanStack Query hooks — **one file per domain**, e.g. `useVendorOrders.ts`, `useAdminStores.ts`, `useTaxonomy.ts`.

Pattern: hook → `src/lib/api/<domain>.ts` → `executeQuery` / `executeMutation`.

Exceptions and related entry points:

| Hook / file                         | Notes                                          |
| ----------------------------------- | ---------------------------------------------- |
| `useAuth.ts`, `useLogin`, etc.      | Auth session + login mutation                  |
| `useVendorStoreId.ts`               | Active store resolution for vendor scope       |
| `useTheme.ts`                       | Theme preference (not server state)            |
| `src/lib/hooks/useNotifications.ts` | Apollo `useQuery` (used by notification pages) |
| `src/hooks/useNotifications.ts`     | TanStack Query variant (not what pages import) |

---

## `src/lib/`

### Data & GraphQL

| Path                                    | Purpose                                                           |
| --------------------------------------- | ----------------------------------------------------------------- |
| `api/`                                  | GraphQL service functions (**not REST**) — one module per domain  |
| `api/errors.ts`                         | `getErrorMessage()`                                               |
| `api/error-messages.ts`                 | Thai API error copy                                               |
| `graphql/client.ts`                     | ApolloClient + `executeQuery` / `executeMutation` + auth retry    |
| `graphql/documents.ts`                  | Inline `gql` operations (majority)                                |
| `graphql/operations/*.graphql`          | Codegen sources: search, notifications, promotions, taxonomy      |
| `graphql/generated/graphql.ts`          | Codegen output — do not edit                                      |
| `graphql/mappers.ts`                    | GQL → domain types                                                |
| `graphql/tokens.ts`                     | JWT cookie read/write (`accessToken`, `refreshToken`)             |
| `react-query/provider.tsx`              | TanStack Query defaults                                           |
| `react-query/keys.ts`                   | Shared query key factories                                        |
| `react-query/prefetch-dashboard-nav.ts` | Sidebar hover/focus prefetch                                      |
| `hooks/useNotifications.ts`             | Apollo notifications polling                                      |
| `providers.tsx`                         | `ApolloProvider` + `QueryProvider` + toast + auth-failure handler |
| `config.ts`                             | GraphQL / API URLs, cookie name constants, shared enums           |

**`lib/api/` exception:** Vendor product import REST (`POST /api/v1/stores/:storeId/products`) is documented at `/vendor/api/docs` for external clients. Admin UI does not call it from `lib/api/`.

### Domain helpers (no GraphQL network)

| Path                  | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `auth/proxy-auth.ts`  | Role redirect helpers for `proxy.ts`      |
| `auth-session.ts`     | Clear session on auth failure             |
| `jwt.ts`              | Decode / portal role from JWT             |
| `audit-logs/`         | Audit log labels                          |
| `constants/`          | Static lists (e.g. Thai banks)            |
| `datetime/`           | Thai datetime / calendar helpers          |
| `email-verification/` | Resend cooldown helpers                   |
| `i18n/th.ts`          | Shared Thai display strings               |
| `markdown/`           | Product description markdown helpers      |
| `notifications/`      | Notification deep-link routes             |
| `orders/`             | Order display, workflow, store analytics  |
| `payouts/`            | Payout status labels                      |
| `promotions/`         | Promotion metadata helpers                |
| `vendor/`             | Review filters, store-access helpers      |
| `validations/`        | Zod schemas (`index.ts`, `promotions.ts`) |
| `theme.ts`            | Theme init script / persistence           |
| `utils.ts`            | `cn()` and small UI utilities             |
| `variants.ts`         | Product variant helpers                   |

---

## `src/stores/`

| File              | Persisted key (localStorage) | Purpose                          |
| ----------------- | ---------------------------- | -------------------------------- |
| `auth.store.ts`   | `sopet-admin-auth`           | User, `isAuthenticated`, hydrate |
| `vendor.store.ts` | `sopet-vendor-store`         | `activeStoreId` for multi-store  |

---

## `src/types/`

Shared TypeScript types (`api.ts`, `audit-logs.ts`, `index.ts`).

---

## `src/proxy.ts`

Next.js 16 request interceptor (not `middleware.ts`). Auth gate for portal and guest-only register routes. Logic: `src/lib/auth/proxy-auth.ts`.

Matcher: `/admin/:path*`, `/vendor/:path*`, `/register`, `/register/:path*`.

---

## `src/test/`

Vitest harness helpers (e.g. taxonomy E2E fixture harness used by unit tests).

---

## `e2e/`

Playwright browser specs and fixtures:

| Path                              | Purpose                                |
| --------------------------------- | -------------------------------------- |
| `*.spec.ts`                       | Auth, public pages, prefetch, etc.     |
| `*.fixture.e2e.spec.ts`           | Multi-step journeys with GraphQL mocks |
| `fixtures/taxonomy/admin-auth.ts` | Cookie JWT for admin tests             |
| `fixtures/graphql-route.ts`       | GraphQL route mocking helpers          |

---

## Config (repo root)

| File                                         | Purpose                                      |
| -------------------------------------------- | -------------------------------------------- |
| `package.json`                               | Yarn scripts (dev :3001, codegen, test, e2e) |
| `next.config.ts`                             | `/graphql` rewrite, image remote patterns    |
| `codegen.ts`                                 | GraphQL Code Generator config                |
| `playwright.config.ts`                       | E2E against port 3001                        |
| `vitest.config.ts`                           | Unit/integration tests under `src/`          |
| `vercel.json`                                | Vercel install / git deploy settings         |
| `.husky/pre-commit`                          | lint-staged → Prettier                       |
| `scripts/ensure-graphql-schema.mjs`          | Resolve or fetch schema for codegen          |
| `scripts/fix-graphql-codegen-duplicates.mjs` | Guard duplicate codegen symbols              |

## Related docs

- [Architecture](architecture.md)
- [Routing](routing.md)
- [Development guide](development-guide.md)
