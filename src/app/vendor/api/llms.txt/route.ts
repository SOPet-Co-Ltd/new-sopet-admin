import { NextResponse } from 'next/server';

import { resolvePublicApiBaseUrl } from '@/lib/config';

export const revalidate = 86400;

function buildLlmsTxtContent(adminOrigin: string): string {
  const apiBaseUrl = resolvePublicApiBaseUrl();

  return `# SOPET Vendor Product API

> REST API for approved SOPET stores to create product drafts and update product info / variant stock·price from external systems (ERP, POS, inventory tools).

> Managed in the vendor dashboard. API keys are store-scoped. Products created via this API are always saved as draft and must be reviewed/published in the vendor UI. Product images may be supplied as remote URLs; the server downloads them into object storage (source URLs are never stored).

## Documentation

- Human API docs (Thai UI): ${adminOrigin}/vendor/api/docs
- Create and revoke API keys: ${adminOrigin}/vendor/api
- This file: ${adminOrigin}/vendor/api/llms.txt

## Base URL

${apiBaseUrl}

Replace \`{API_BASE_URL}\` with the SOPET backend origin (the GraphQL host without \`/graphql\`). Do not call GraphQL for this integration.

## Authentication

API keys use the prefix \`sopet_sk_\`. Create them at ${adminOrigin}/vendor/api (store manager/owner only).

Send the key with either header:

- \`Authorization: Bearer sopet_sk_...\`
- \`X-Api-Key: sopet_sk_...\`

The key must belong to the same store as \`{storeId}\` in the URL. The store must be approved (\`APPROVED\`).

## Store ID

Use the UUID Store ID shown at ${adminOrigin}/vendor/api in every request path under \`/api/v1/stores/{storeId}/...\`.

## Endpoints

### Create product (draft)

- Method: \`POST\`
- Path: \`/api/v1/stores/{storeId}/products\`
- Success: \`201\` with the created product object (status \`draft\`)

#### Request body fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | string | yes | 1–255 chars |
| description | string | no | Product description |
| warning | string | no | Max 1000 chars |
| expiryDate | string | no | \`YYYY-MM-DD\` |
| category | string | no | Approved category **name** (not id); case-insensitive match |
| tags | string[] | no | Approved tag **names**; case-insensitive |
| petType | string | no | Approved pet type **name**; recommended — required later to publish |
| brand | string | no | Approved brand **name**; case-insensitive |
| images | string[] | no | Remote image URLs (http/https), max 10; each ≤ 5 MB; jpeg/png/webp/gif. Server downloads → WebP → object storage; only storage URLs are persisted. First image = thumbnail. Any failure fails the whole create. |
| variants | array | yes | Option groups / dimensions (≥ 1). No sku/stock/price here |
| variantItems | array | yes | Purchasable combinations (≥ 1). Holds sku/stock/price |

#### variants[] / variantItems[]

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| variants[].name | string | yes | Dimension name, e.g. "สี" |
| variants[].values | string[] | yes | Allowed values |
| variantItems[].sku | string | yes | Unique SKU |
| variantItems[].stock | integer | yes | ≥ 0 |
| variantItems[].price | number | yes | THB absolute price ≥ 0 |
| variantItems[].options | object | yes | Map of every variants[].name → one of its values |

Create rules: base price = min(variantItems[].price); always \`draft\`; taxonomy names must already be approved.

### Update product info

- Method: \`PATCH\`
- Path: \`/api/v1/stores/{storeId}/products/{productId}\`
- Success: \`200\` with the updated product
- Body: all fields optional; at least one required. Allowed: \`name\`, \`description\`, \`warning\`, \`expiryDate\`, \`category\`, \`tags\`, \`petType\`, \`brand\`, \`images\` (same semantics as create; \`images\` replaces the full set when sent, including \`[]\` to clear).
- Not allowed: stock, price, status, variants.

### Update variant stock / price (by id)

- Method: \`PATCH\`
- Path: \`/api/v1/stores/{storeId}/products/{productId}/variants/{variantId}\`
- Success: \`200\` with the updated variant (\`price\` is absolute effective THB)
- Body: \`stock\` (integer ≥ 0) and/or \`price\` (number ≥ 0 absolute THB); at least one required.

### Update variant stock / price (by SKU)

- Method: \`PATCH\`
- Path: \`/api/v1/stores/{storeId}/variants/by-sku/{sku}\`
- Same body as by-id. SKU lookup is store-scoped.

Price rule: REST \`price\` is absolute; stored as \`priceAdjustment = price - product.basePrice\` (sibling variants / basePrice are not recomputed).

#### Example curl (update stock by SKU)

\`\`\`bash
curl -X PATCH "${apiBaseUrl}/api/v1/stores/{storeId}/variants/by-sku/CAT-ORG-2KG-CHK" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"stock":100,"price":529}'
\`\`\`

## Error responses

Shape:

\`\`\`json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "..." },
  "meta": { "timestamp": "...", "path": "...", "method": "..." }
}
\`\`\`

| HTTP | Code | Meaning |
| --- | --- | --- |
| 401 | INVALID_API_KEY | Missing, invalid, revoked, or wrong-store key |
| 403 | STORE_SUSPENDED | Store not approved or suspended |
| 400 | VALIDATION_ERROR | Request body failed validation / empty PATCH |
| 400 | VARIANTS_REQUIRED | Missing/empty variants (create) |
| 400 | VARIANT_ITEMS_REQUIRED | Missing/empty variantItems (create) |
| 400 | INVALID_VARIANT_OPTIONS | options missing a group or using undeclared values |
| 400 | CATEGORY_NOT_FOUND / TAG_NOT_FOUND / PET_TYPE_NOT_FOUND / BRAND_NOT_FOUND | Unknown or unapproved taxonomy name |
| 400 | SKU_EXISTS | SKU already exists (create) |
| 400 | INVALID_IMAGE_URL / INVALID_IMAGE_TYPE / IMAGE_TOO_LARGE | Image download or validation failed |
| 400 | TOO_MANY_IMAGES | More than 10 images |
| 404 | PRODUCT_NOT_FOUND | Missing product or wrong store |
| 404 | VARIANT_NOT_FOUND | Missing variant, wrong store, or not under productId |

## Out of scope

- Listing, deleting, or publishing products via REST
- Multipart / base64 image upload on REST (use image URLs instead)
- Creating new variants after product create
- Orders or GraphQL / admin JWT flows

Use the human docs at ${adminOrigin}/vendor/api/docs for the Thai UI field tables.
`;
}

export async function GET(request: Request): Promise<NextResponse> {
  const adminOrigin = new URL(request.url).origin;
  const body = buildLlmsTxtContent(adminOrigin);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
