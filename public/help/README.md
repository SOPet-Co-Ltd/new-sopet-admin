# Help Center Screenshots

PNG screenshots used by Thai guidebook articles under `src/content/help/`.

## Refresh

With admin (`:3001`) and backend (`:3002`) running and seed users available:

```bash
yarn help:screenshots          # admin + vendor + shared auth + detail pages
yarn help:screenshots admin
yarn help:screenshots vendor
```

Images are written to:

- `public/help/admin/*.png` — list, create, detail, settings tabs, forms
- `public/help/vendor/*.png` — list, create, product edit/variants/stock, forms
- `public/help/shared/` — login, register, forgot-password, guide hub

Markdown references them as `/help/...` (served by Next.js from `public/`).
Place screenshots under the step heading they illustrate (before numbered steps when possible).
