# Components (Admin)

## Organization

| Folder                   | Scope             | Examples                                               |
| ------------------------ | ----------------- | ------------------------------------------------------ |
| `components/ui/`         | Shared primitives | `button`, `dialog`, `data-table`, `image-upload-field` |
| `components/admin/`      | Platform admin    | `admin-layout`, taxonomy tables, search forms          |
| `components/vendor/`     | Vendor dashboard  | order workflow, product editor, review UI              |
| `components/promotions/` | Both portals      | promotion form components                              |
| `components/analytics/`  | Both portals      | `SalesOverTimeChart`, `BreakdownChart`                 |
| `components/disputes/`   | Admin + vendor    | dispute queue, chat, resolution                        |

## Naming

- Files: **kebab-case** (`vendor-review-list-item.tsx`)
- Components: PascalCase exports
- `'use client'` on interactive modules

## UI primitives

`components/ui/` — hand-rolled with Radix where needed:

```typescript
// components/ui/button.tsx
const buttonVariants = cva('...', {
  variants: { variant: { default: '...', destructive: '...' } },
});
```

Pattern: `forwardRef`, `cn()` from `src/lib/utils.ts`, Radix `Slot`.

## Layout

`dashboard-shell.tsx` — shared sidebar, logout, theme toggle, nav prefetch.

Portal-specific nav in:

- `components/admin/admin-layout.tsx`
- `components/vendor/vendor-layout.tsx`

## Styling

Tailwind v4 + CSS variables in `globals.css`:

```css
--brand: ...;
--ink: ...;
--muted: ...;
--danger: ...;
```

Fonts: Noto Sans Thai + Noto Serif Thai (`layout.tsx`).

Thai copy throughout; `lang="th"` on `<html>`.

### Vendor dashboard charts

`SalesOverTimeChart` (`components/analytics/sales-over-time-chart.tsx`) renders bar heights as percentages inside a fixed `h-48` container. Column wrappers must use `h-full` + `items-stretch` on the row — otherwise bars render at 0px.

Data for vendor dashboard comes from `computeStoreSalesOverTime` in `lib/orders/store-analytics.ts` (client-side from `vendorOrders`). Excludes `cancelled` and `refunded` orders.

### Vendor orders + disputes

`/vendor/orders` shows **two badges** per row when applicable: order fulfillment status (`Badge`) and return status (`DisputeStatusBadge` from `useVendorDisputes`). Order detail dialog links to `/vendor/disputes/[id]`.

See [workspace returns-and-disputes](../../new-sopet-workspace/docs/developer/returns-and-disputes.md).

## Error/loading states

| Component               | Use                        |
| ----------------------- | -------------------------- |
| `query-error-state.tsx` | Failed queries/mutations   |
| `error-fallback.tsx`    | Route error boundaries     |
| Loading                 | Inline `กำลังโหลด...` text |

## Related docs

- [Folder structure](folder-structure.md)
- [Forms & validation](forms-validation.md)
