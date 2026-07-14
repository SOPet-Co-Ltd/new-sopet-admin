# Admin Folder Structure

## `src/app/`

| Path              | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `login/`          | Email + password login                   |
| `register/`       | Vendor registration                      |
| `reset-password/` | Password reset flow                      |
| `admin/`          | Platform admin routes                    |
| `vendor/`         | Vendor dashboard routes                  |
| `layout.tsx`      | Root: fonts, `AppProviders`, `lang="th"` |

**Layouts:**

- `admin/layout.tsx` → `AdminLayout` + `AuthGuard requiredRole="admin"`
- `vendor/layout.tsx` → `VendorLayout` + `AuthGuard requiredRole="vendor"`

---

## `src/components/`

| Folder           | Add when                                         |
| ---------------- | ------------------------------------------------ |
| `admin/`         | Platform-only UI (taxonomy tables, search admin) |
| `vendor/`        | Store-scoped UI (order workflow, product editor) |
| `ui/`            | Shared primitives (button, dialog, data-table)   |
| `promotions/`    | Shared promotion forms (both portals)            |
| `analytics/`     | Shared chart components                          |
| `notifications/` | Notification cards                               |

Root components: `auth-guard.tsx`, `dashboard-shell.tsx`, `query-error-state.tsx`

---

## `src/hooks/`

TanStack Query hooks (one file per domain, e.g. `useVendorOrders.ts`, `useAdminStores.ts`). **Add new data hooks here.**

Pattern: `useVendorOrders.ts` → calls `lib/api/orders.ts`

---

## `src/lib/api/`

GraphQL service layer (despite "api" name, **not REST**) — one module per domain (`orders.ts`, `taxonomy.ts`, `admin-vendors.ts`, etc.).

```typescript
// src/lib/api/orders.ts
import { executeQuery } from '@/lib/graphql/client';
import { VENDOR_ORDERS_QUERY } from '@/lib/graphql/documents';
import { mapOrder } from '@/lib/graphql/mappers';

export function getVendorOrders(storeId: string) {
  return executeQuery(VENDOR_ORDERS_QUERY, { storeId }).then((data) =>
    data.vendorOrders.map(mapOrder),
  );
}
```

**Exception:** Vendor REST API is external — documented at `/vendor/api/docs`, not called from `lib/api/`.

---

## `src/lib/graphql/`

| File                   | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `client.ts`            | ApolloClient + `executeQuery`/`executeMutation` + auth retry |
| `documents.ts`         | Inline `gql` strings (~majority of operations)               |
| `operations/*.graphql` | Codegen source (search, notifications, promotions, taxonomy) |
| `generated/graphql.ts` | Codegen output                                               |
| `mappers.ts`           | GQL → domain type mapping                                    |
| `tokens.ts`            | Cookie read/write for JWT                                    |

---

## `src/lib/validations/`

Zod schemas: `index.ts` (most forms), `promotions.ts`

---

## `src/stores/`

Zustand: `auth.store.ts`, `vendor.store.ts`

---

## `src/proxy.ts`

Server-side auth gate for `/admin/*` and `/vendor/*`. Next.js 16 request interceptor (not `middleware.ts`).

---

## `e2e/`

Playwright specs + fixtures (`e2e/fixtures/taxonomy/admin-auth.ts`)

---

## Config (root)

| File                   | Purpose                        |
| ---------------------- | ------------------------------ |
| `next.config.ts`       | GraphQL rewrite, image domains |
| `codegen.ts`           | GraphQL codegen                |
| `playwright.config.ts` | E2E (port 3001)                |
| `vitest.config.ts`     | Unit tests                     |
| `.husky/pre-commit`    | lint-staged → Prettier         |

## Related docs

- [Development guide](development-guide.md)
