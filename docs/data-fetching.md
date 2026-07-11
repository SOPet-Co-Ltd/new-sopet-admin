# Data Fetching

## Architecture

```mermaid
sequenceDiagram
  participant P as Page
  participant H as hooks/useX.ts
  participant A as lib/api/x.ts
  participant C as graphql/client.ts
  participant B as Backend

  P->>H: useVendorOrders()
  H->>A: fetchVendorOrders(storeId)
  A->>C: executeQuery(QUERY, vars)
  C->>B: POST /graphql
  B-->>C: JSON
  C-->>A: data
  A-->>H: mapped result
  H-->>P: { data, isLoading, error }
```

## TanStack Query (primary)

**Provider:** `src/lib/react-query/provider.tsx`

Defaults:

- `staleTime: 60_000` (60s)
- `retry: 1`
- `refetchOnWindowFocus: false`

**Query keys:** `src/lib/react-query/keys.ts`

```typescript
export const orderKeys = {
  all: ['orders'] as const,
  vendor: (storeId: string) => [...orderKeys.all, 'vendor', storeId] as const,
};
```

**Hook pattern:**

```typescript
// src/hooks/useVendorOrders.ts
export function useVendorOrders() {
  const storeId = useVendorStoreId();
  return useQuery({
    queryKey: orderKeys.vendor(storeId),
    queryFn: () => fetchVendorOrders(storeId),
    enabled: !!storeId,
    staleTime: 0, // override for real-time orders
  });
}
```

**Mutations:**

```typescript
return useMutation({
  mutationFn: updateOrderStatus,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.vendor(storeId) }),
  meta: { toastError: true },
});
```

## lib/api (GraphQL service layer)

All 33 modules in `src/lib/api/` call GraphQL via `executeQuery`/`executeMutation`.

**Not REST** — folder name is historical. Operations from `src/lib/graphql/documents.ts`.

```typescript
import { executeQuery } from '@/lib/graphql/client';
import { VENDOR_ORDERS_QUERY } from '@/lib/graphql/documents';

export async function fetchVendorOrders(storeId: string) {
  const data = await executeQuery(VendorOrdersQuery, { storeId });
  return data.vendorOrders.map(mapOrder);
}
```

## Apollo Client (transport)

`src/lib/graphql/client.ts`:

- `HttpLink` to `GRAPHQL_URL`
- Auth header from cookies
- `withAuthRetry` for 401
- `ApolloProvider` in `providers.tsx`

Apollo is **not** the primary React data layer.

## Apollo hooks (exception)

`src/lib/hooks/useNotifications.ts` — direct `useQuery` with polling.

Used by admin/vendor notification pages. A TanStack Query version exists at `src/hooks/useNotifications.ts` but pages use the Apollo version.

## GraphQL operations

| Source         | Location                                                          |
| -------------- | ----------------------------------------------------------------- |
| Inline gql     | `src/lib/graphql/documents.ts` (~2200 lines)                      |
| .graphql files | `src/lib/graphql/operations/` (search, notifications, promotions) |
| Generated      | `src/lib/graphql/generated/graphql.ts`                            |

Codegen: `yarn graphql:codegen` (runs on `prebuild`, `pretype-check`).

## Nav prefetch

`src/lib/react-query/prefetch-dashboard-nav.ts` — prefetches route data on sidebar hover/focus.

### Cache invalidation (disputes)

`useResolveDispute` and `useMarkDisputeInProgress` invalidate:

- `queryKeys.disputes.all`
- `queryKeys.orders.vendorRoot()` — refreshes vendor order list badges after resolution changes order status to `refunded`

## Error handling

- `getErrorMessage()` from `src/lib/api/errors.ts`
- Thai messages from `src/lib/api/error-messages.ts`
- `QueryErrorState` / `MutationErrorState` components

## External REST API

Vendor product import API (`POST /api/v1/stores/:storeId/products`) is documented at `/vendor/api/docs` for external consumers. The admin app does not call it from `lib/api/`.

`getApiBaseUrl()` in `config.ts` builds the URL for documentation display only.

## Related docs

- [GraphQL operations](../../new-sopet/sopet-storefront/docs/graphql.md) (storefront pattern differs)
- [Feature development](feature-development.md)
