# SOPET Admin

Administrative and vendor dashboard for the SOPET multi-vendor pet e-commerce platform.

**Port:** `3001` · **Stack:** Next.js 16, React 19, GraphQL

## Overview

Single Next.js application with two portals:

- **`/admin`** — platform administration (stores, vendors, taxonomy, search tuning, analytics)
- **`/vendor`** — store management (products, orders, reviews, promotions, API keys)

Shared auth routes: `/login`, `/register`, `/reset-password`, `/verify-email`, `/invite/store`.

## Tech stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Framework | Next.js 16 (App Router)                                |
| UI        | React 19, Tailwind CSS 4, Radix UI                     |
| Data      | TanStack Query 5 + Apollo Client 4 (GraphQL transport) |
| Forms     | React Hook Form + Zod 4                                |
| State     | Zustand                                                |
| Tables    | TanStack Table                                         |
| Testing   | Vitest + Playwright                                    |
| Codegen   | GraphQL Code Generator                                 |

## Architecture

```text
Page  →  hooks/ (TanStack Query)  →  lib/api/ (GraphQL)  →  /graphql  →  Backend
```

Defense-in-depth auth: `src/proxy.ts` (server) + `AuthGuard` (client). See [docs/architecture.md](docs/architecture.md).

## Prerequisites

- Node.js 20+
- Yarn 1.22+
- Running [backend](../sopet-backend/) at `http://localhost:3002`
- Backend schema at `../sopet-backend/src/schema.gql` (for GraphQL codegen)

## Installation

```bash
yarn install
cp .env.example .env
```

## Environment setup

| Variable                  | Default                           | Purpose                                 |
| ------------------------- | --------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL` | `/graphql`                        | Browser GraphQL (proxied)               |
| `GRAPHQL_SSR_URL`         | `http://localhost:3002/graphql`   | Server-side GraphQL                     |
| `NEXT_PUBLIC_API_URL`     | `http://localhost:3002`           | Vendor REST API docs URL                |
| `NEXT_PUBLIC_CDN_URL`     | _(unset)_                         | Public CDN base URL for uploaded images |
| `GRAPHQL_SCHEMA_PATH`     | `../sopet-backend/src/schema.gql` | Codegen schema source                   |

## Running locally

```bash
yarn dev    # http://localhost:3001
```

Login after backend seed (`yarn db:seed:dev` in sopet-backend):

| Role   | Email              | Password   |
| ------ | ------------------ | ---------- |
| Admin  | `admin@sopet.org`  | `P@ssw0rd` |
| Vendor | `vendor@sopet.org` | `P@ssw0rd` |

Requires backend at `http://localhost:3002` (sibling repo `../sopet-backend`).

## Build

```bash
yarn build    # Runs graphql:codegen first
yarn start    # Port 3001
```

## Testing

```bash
yarn test              # Vitest unit/integration
yarn test:watch
yarn test:coverage
yarn test:e2e          # Playwright (starts dev server)
yarn test:e2e:ui
```

## Linting & formatting

```bash
yarn lint
yarn format
yarn format:check      # CI
yarn type-check        # tsc --noEmit (runs codegen first)
```

## Project structure

```text
src/
├── app/
│   ├── admin/              # Platform admin routes
│   ├── vendor/             # Vendor dashboard routes
│   ├── login/              # Authentication
│   └── register/           # Vendor registration
├── components/
│   ├── admin/              # Admin-specific UI
│   ├── vendor/             # Vendor-specific UI
│   └── ui/                 # Shared primitives
├── hooks/                  # TanStack Query hooks
├── lib/
│   ├── api/                # GraphQL service layer
│   ├── graphql/            # Apollo client, documents
│   └── validations/        # Zod schemas
├── stores/                 # Zustand (auth, vendor context)
└── proxy.ts                # Server auth gate
```

## Documentation

| Document                                           | Description                  |
| -------------------------------------------------- | ---------------------------- |
| [Docs index](docs/README.md)                       | Full documentation           |
| [Architecture](docs/architecture.md)               | Admin vs vendor, data layers |
| [Folder structure](docs/folder-structure.md)       | Directory guide              |
| [Routing](docs/routing.md)                         | Route map                    |
| [Authentication](docs/authentication.md)           | proxy.ts, cookies, guards    |
| [Data fetching](docs/data-fetching.md)             | TanStack Query + lib/api     |
| [Components](docs/components.md)                   | UI organization              |
| [Forms & validation](docs/forms-validation.md)     | react-hook-form + zod        |
| [Development guide](docs/development-guide.md)     | Where to put new code        |
| [Feature development](docs/feature-development.md) | End-to-end guide             |
| [Coding conventions](docs/coding-conventions.md)   | Naming, testing, CI          |

## Common commands

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `yarn dev`             | Development server (:3001)           |
| `yarn graphql:codegen` | Regenerate types from backend schema |
| `yarn graphql:watch`   | Watch schema changes                 |
| `yarn type-check`      | TypeScript check                     |
| `yarn test:e2e`        | Playwright E2E                       |

## Deployment

Deployed to **Vercel** via GitHub Actions deploy hooks.

| Branch              | Environment |
| ------------------- | ----------- |
| `deploy/production` | production  |
| `deploy/uat`        | uat         |

Push to a deploy branch triggers `.github/workflows/deploy.yml`, which POSTs to `VERCEL_DEPLOY_HOOK_URL` (configured per GitHub Environment).

## Contributing

1. Husky pre-commit runs Prettier via lint-staged
2. CI on PR (`main`, `uat`): format → type-check → test → build → Playwright
3. Add GraphQL ops to `lib/graphql/documents.ts`, then `lib/api/`, then `hooks/`
4. Thai UI copy; `lang="th"` on root layout
5. See [feature development guide](docs/feature-development.md)

**Note:** `lib/api/` calls GraphQL, not REST. Vendor REST API is for external integrations (documented at `/vendor/api/docs`).

Schema changes land in `../sopet-backend` first (`src/schema.gql`), then run `yarn graphql:codegen` here (and in `../sopet-storefront` if affected). Commit each repo separately.
