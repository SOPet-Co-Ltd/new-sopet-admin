# Development Guide (Admin)

## Where should I add a new admin page?

1. `src/app/admin/my-feature/page.tsx`
2. Component in `src/components/admin/` if admin-only
3. Hook in `src/hooks/useMyFeature.ts`
4. API function in `src/lib/api/my-feature.ts`
5. GraphQL operation in `src/lib/graphql/documents.ts` (or `.graphql` + codegen)

## Where should I add a new vendor page?

Same pattern under `src/app/vendor/` and `src/components/vendor/`.

## Where should I add a reusable component?

| Scope                      | Location                                         |
| -------------------------- | ------------------------------------------------ |
| Primitive (button, dialog) | `src/components/ui/`                             |
| Admin-only                 | `src/components/admin/`                          |
| Vendor-only                | `src/components/vendor/`                         |
| Both portals               | `src/components/promotions/`, `analytics/`, etc. |

## Where should I add business logic?

| Logic                              | Location                                          |
| ---------------------------------- | ------------------------------------------------- |
| Data fetching/mapping              | `src/lib/api/*.ts` + `src/lib/graphql/mappers.ts` |
| Display formatting                 | `src/lib/orders/display.ts`, `src/lib/i18n/th.ts` |
| Validation                         | `src/lib/validations/`                            |
| Domain rules requiring persistence | **Backend** — not admin                           |

## How should I call APIs?

1. Add GraphQL operation to `documents.ts` or `operations/*.graphql`
2. `yarn graphql:codegen` if using `.graphql` files
3. Add `lib/api/feature.ts` with `executeQuery`/`executeMutation`
4. Add `hooks/useFeature.ts` with TanStack Query
5. Use hook in page/component

## How should I access the database?

**You cannot.** All data via GraphQL.

## How should I write tests?

| Type            | Location                                |
| --------------- | --------------------------------------- |
| Util/validation | `*.test.ts` co-located                  |
| Component       | `*.test.tsx` or `*.spec.tsx` co-located |
| Page            | `app/admin/feature/page.test.tsx`       |
| E2E             | `e2e/feature.spec.ts`                   |

## Related docs

- [Feature development](feature-development.md)
- [Folder structure](folder-structure.md)
