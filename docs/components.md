# Components (Admin)

## Organization

| Folder                      | Scope             | Examples                                               |
| --------------------------- | ----------------- | ------------------------------------------------------ |
| `components/ui/`            | Shared primitives | `button`, `dialog`, `data-table`, `image-upload-field` |
| `components/admin/`         | Platform admin    | `admin-layout`, taxonomy tables, search forms          |
| `components/vendor/`        | Vendor dashboard  | order workflow, product editor, review UI              |
| `components/promotions/`    | Both portals      | promotion form components                              |
| `components/analytics/`     | Both portals      | `SalesOverTimeChart`, `BreakdownChart`                 |
| `components/notifications/` | Both portals      | `NotificationCard`                                     |

Root-level shared modules: `auth-guard.tsx`, `dashboard-shell.tsx`, `query-error-state.tsx`, `error-fallback.tsx`, `theme-toggle.tsx`.

## Naming

- Files: **kebab-case** (`vendor-review-list-item.tsx`)
- Components: PascalCase exports
- `'use client'` on interactive modules

## UI primitives

`components/ui/` — hand-rolled primitives with Radix where needed (`Slot`, dialog, select, dropdown).

Buttons use variant/size class maps + `cn()` from `src/lib/utils.ts` and `forwardRef` (no `class-variance-authority` dependency).

```typescript
// components/ui/button.tsx (shape)
const variantClasses: Record<ButtonVariant, string> = { default: '...', /* … */ };
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(…);
```

## Layout

`dashboard-shell.tsx` — shared sidebar, logout, theme toggle, nav prefetch.

Portal-specific nav:

- `components/admin/admin-layout.tsx`
- `components/vendor/vendor-layout.tsx`

## Styling

Tailwind v4 + CSS variables in `src/app/globals.css` (`--brand`, `--ink`, `--muted`, `--danger`, …).

Fonts: Noto Sans Thai + Noto Serif Thai (`src/app/layout.tsx`). Thai copy throughout; `lang="th"` on `<html>`.

### Vendor dashboard charts

`SalesOverTimeChart` (`components/analytics/sales-over-time-chart.tsx`) renders bar heights as percentages inside a fixed `h-48` container. Column wrappers must use `h-full` + `items-stretch` on the row — otherwise bars render at 0px.

Vendor dashboard series come from `computeStoreSalesOverTime` in `lib/orders/store-analytics.ts` (client-side from `vendorOrders`). Excludes `cancelled` and `refunded` orders.

### Vendor orders

`/vendor/orders` shows a fulfillment-status `Badge` (`labelOrderStatus`) and a status filter (`Select`). Row actions (`VendorOrdersActionMenu`) open `VendorOrderDetailDialog` or copy the public tracking link (`VendorOrderTrackingLinkDialog`).

## Error / loading states

| Component               | Use                        |
| ----------------------- | -------------------------- |
| `query-error-state.tsx` | Failed queries/mutations   |
| `error-fallback.tsx`    | Route error boundaries     |
| Loading                 | Inline `กำลังโหลด...` text |

## Related docs

- [Folder structure](folder-structure.md)
- [Forms & validation](forms-validation.md)
