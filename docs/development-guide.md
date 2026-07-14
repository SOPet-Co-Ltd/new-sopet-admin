# Development Guide (Admin)

Quick answers for where new code belongs. For a full end-to-end walkthrough, see [feature-development.md](feature-development.md).

## Where should I add a new admin page?

1. `src/app/admin/<feature>/page.tsx`
2. Admin-only UI in `src/components/admin/`
3. Hook in `src/hooks/use<Feature>.ts`
4. API in `src/lib/api/<feature>.ts`
5. GraphQL operation in `src/lib/graphql/documents.ts` (or `operations/*.graphql` + `yarn graphql:codegen`)
6. Query key factory in `src/lib/react-query/keys.ts` when introducing a new domain

## Where should I add a new vendor page?

Same pattern under `src/app/vendor/` and `src/components/vendor/`. Scope data with `useVendorStoreId()` when the API is store-scoped.

## Where should I add a reusable component?

| Scope                      | Location                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Primitive (button, dialog) | `src/components/ui/`                                                                |
| Admin-only                 | `src/components/admin/`                                                             |
| Vendor-only                | `src/components/vendor/`                                                            |
| Both portals               | `src/components/promotions/`, `analytics/`, `notifications/`, or root `components/` |

## Where should I add business / display logic?

| Logic                              | Location                                          |
| ---------------------------------- | ------------------------------------------------- |
| Data fetching / mapping            | `src/lib/api/*.ts` + `src/lib/graphql/mappers.ts` |
| Display formatting                 | `src/lib/orders/`, `src/lib/i18n/th.ts`, etc.     |
| Validation                         | `src/lib/validations/`                            |
| Auth redirect rules                | `src/lib/auth/proxy-auth.ts`                      |
| Rules that must persist or enforce | **Backend** — not this app                        |

## How should I call APIs?

1. Add GraphQL operation to `documents.ts` or `operations/*.graphql`
2. Run `yarn graphql:codegen` when using `.graphql` files (also runs on `prebuild` / `pretype-check`)
3. Add `lib/api/<feature>.ts` with `executeQuery` / `executeMutation`
4. Add `hooks/use<Feature>.ts` with TanStack Query
5. Consume the hook from the page or component

Do not call Apollo directly from pages except the established notifications path (`src/lib/hooks/useNotifications.ts`).

## How should I access the database?

You cannot. All product data goes through the backend GraphQL API (`http://localhost:3002` locally).

## How should I write tests?

| Type              | Location / pattern                                     |
| ----------------- | ------------------------------------------------------ |
| Util / validation | Colocated `*.test.ts`                                  |
| Component / hook  | Colocated `*.test.tsx` or `*.spec.tsx`                 |
| Integration       | `*.int.test.tsx`                                       |
| RTL multi-step    | `*.fixture.e2e.test.tsx`                               |
| Page              | e.g. `src/app/admin/<feature>/page.test.tsx`           |
| Browser E2E       | `e2e/<feature>.spec.ts` or `e2e/*.fixture.e2e.spec.ts` |

```bash
yarn test
yarn test:e2e
```

## Related docs

- [Feature development](feature-development.md)
- [Folder structure](folder-structure.md)
- [Coding conventions](coding-conventions.md)
