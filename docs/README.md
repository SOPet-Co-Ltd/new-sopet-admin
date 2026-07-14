# Admin Documentation

Admin and vendor dashboard for SOPET — single Next.js application on port **3001**.

## Index

| Document                                      | Description                             |
| --------------------------------------------- | --------------------------------------- |
| [Architecture](architecture.md)               | Portals, stack, data and auth layers    |
| [Folder structure](folder-structure.md)       | `src/` layout verified against the tree |
| [Routing](routing.md)                         | `/admin`, `/vendor`, and auth routes    |
| [Authentication](authentication.md)           | `proxy.ts`, AuthGuard, cookies, refresh |
| [Data fetching](data-fetching.md)             | TanStack Query + Apollo + `lib/api`     |
| [Components](components.md)                   | `admin/`, `vendor/`, `ui/`, shared      |
| [Forms & validation](forms-validation.md)     | react-hook-form + Zod                   |
| [Coding conventions](coding-conventions.md)   | Naming, formatting, Vitest, Playwright  |
| [Feature development](feature-development.md) | End-to-end feature workflow             |
| [Development guide](development-guide.md)     | Where to put new code                   |

## Related repos

| Repo       | Path (sibling)        | Role                          |
| ---------- | --------------------- | ----------------------------- |
| Backend    | `../sopet-backend`    | GraphQL schema + business API |
| Storefront | `../sopet-storefront` | Customer Next.js app          |

Backend API overview: [../../sopet-backend/docs/api.md](../../sopet-backend/docs/api.md).

## Quick start

```bash
cp .env.example .env
yarn install
yarn dev    # http://localhost:3001
```

Requires the backend at `http://localhost:3002` and schema at `../sopet-backend/src/schema.gql` for codegen.

Login after backend seed: `admin@sopet.org` / `vendor@sopet.org` (password `P@ssw0rd`).

Root README: [../README.md](../README.md).
