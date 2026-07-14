# Admin Documentation

Admin and vendor dashboard — single Next.js application.

## Index

| Document                                      | Description                        |
| --------------------------------------------- | ---------------------------------- |
| [Architecture](architecture.md)               | Admin vs vendor split, data layers |
| [Folder structure](folder-structure.md)       | Directory guide                    |
| [Routing](routing.md)                         | `/admin` and `/vendor` routes      |
| [Authentication](authentication.md)           | proxy.ts, AuthGuard, cookies       |
| [Data fetching](data-fetching.md)             | TanStack Query + Apollo + lib/api  |
| [Components](components.md)                   | admin/, vendor/, ui/               |
| [Forms & validation](forms-validation.md)     | react-hook-form + zod              |
| [Coding conventions](coding-conventions.md)   | Naming, testing, formatting        |
| [Feature development](feature-development.md) | Adding admin/vendor features       |
| [Development guide](development-guide.md)     | Where to put new code              |

## Related repos

- [Backend API](../../sopet-backend/docs/api.md) — GraphQL schema owner (`../sopet-backend`)
- Storefront lives in sibling repo `../sopet-storefront`

## Quick start

```bash
cp .env.example .env
yarn install
yarn dev    # http://localhost:3001
```

Login: `admin@sopet.org` / `vendor@sopet.org` (password `P@ssw0rd` after backend seed).
