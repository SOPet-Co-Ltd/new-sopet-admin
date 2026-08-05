import { NextResponse } from 'next/server';

import { resolvePublicApiBaseUrl } from '@/lib/config';

export const revalidate = 86400;

function buildLlmsTxtContent(adminOrigin: string): string {
  const apiBaseUrl = resolvePublicApiBaseUrl();

  return `# SOPET Vendor API

> REST API for approved SOPET stores: create/update/delete product drafts, configure order webhooks, and push tracking numbers from external systems (ERP, POS, n8n, Zapier).

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
- **Important:** response includes product \`id\` (UUID) and each variant's \`id\` — persist these for later PATCH/DELETE.

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

### Delete product

- Method: \`DELETE\`
- Path: \`/api/v1/stores/{storeId}/products/{productId}\`
- Success: \`204\` empty body (soft delete)
- Errors: \`404 PRODUCT_NOT_FOUND\` if missing or wrong store

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

### Configure order webhook

- \`PUT /api/v1/stores/{storeId}/webhook\` — upsert URL + events
- \`GET /api/v1/stores/{storeId}/webhook\` — current config (\`hasSecret: true\`; secret never re-shown)
- \`DELETE /api/v1/stores/{storeId}/webhook\` — remove config

PUT body:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| url | string | yes | HTTPS callback URL |
| events | string[] | no | subset of events below; omit = all events |
| enabled | boolean | no | default true |
| rotateSecret | boolean | no | true regenerates signing secret (returned once) |

Outbound delivery (SOPET → your URL):

- Method: \`POST\`, \`Content-Type: application/json\`
- Headers: \`X-Sopet-Event\`, \`X-Sopet-Delivery-Id\`, \`X-Sopet-Signature: sha256=<hmac_hex>\`
- Body: store-scoped order payload (only that store's line items + customer/shipping snapshot)

| Event | When |
| --- | --- |
| \`order.create\` | Customer placed the order (pending payment) |
| \`order.payment_failed\` | Charge failed or QR expired; order stays pending_payment for retry |
| \`order.paid\` | Payment succeeded — ready to fulfill |
| \`order.processing\` | Vendor acknowledged / preparing |
| \`order.on_hold\` | Order held (e.g. store suspension) |
| \`order.shipped\` | Shipped (tracking set) |
| \`order.delivered\` | Customer confirmed delivery |
| \`order.cancelled\` | Order cancelled |
| \`order.refunded\` | Order refunded |

### Update order tracking

- Method: \`PATCH\`
- Path: \`/api/v1/stores/{storeId}/orders/{orderId}/tracking\`
- Success: \`200\` with store-scoped order + items (includes tracking fields)
- Body: \`trackingNumber\` (required), \`fulfillmentProvider\` (required), \`trackingUrl\` (optional HTTPS)
- Behavior: auto-acknowledges pending items then ships; if already shipped, updates tracking fields only

### Import product review (unknown customer)

- Method: \`POST\`
- Path: \`/api/v1/stores/{storeId}/products/{productId}/reviews\`
- Success: \`201\` with review object (\`status: pending\`, \`source: vendor_import\`, \`customerName: ลูกค้าไม่ระบุชื่อ\`)
- Body: \`rating\` (1–5 required), \`comment\` (optional, ≤ 2000), \`images\` (optional HTTPS URL array, max 5)
- Imported reviews are **not public** until a platform admin approves them in the admin dashboard (\`/admin/reviews\`). After approval they appear on the storefront as unknown customer.

#### Example curl (update stock by SKU)

\`\`\`bash
curl -X PATCH "${apiBaseUrl}/api/v1/stores/{storeId}/variants/by-sku/CAT-ORG-2KG-CHK" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"stock":100,"price":529}'
\`\`\`

#### Example curl (set webhook)

\`\`\`bash
curl -X PUT "${apiBaseUrl}/api/v1/stores/{storeId}/webhook" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/hooks/sopet"}'
\`\`\`

#### Example curl (tracking)

\`\`\`bash
curl -X PATCH "${apiBaseUrl}/api/v1/stores/{storeId}/orders/{orderId}/tracking" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"trackingNumber":"TH123456789","fulfillmentProvider":"Kerry"}'
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
| 400 | INVALID_WEBHOOK_URL / INVALID_WEBHOOK_EVENT | Bad webhook config |
| 400 | INVALID_ORDER_STATUS | Order cannot accept tracking update |
| 404 | PRODUCT_NOT_FOUND | Missing product or wrong store |
| 404 | VARIANT_NOT_FOUND | Missing variant, wrong store, or not under productId |
| 404 | WEBHOOK_NOT_FOUND | Webhook not configured |
| 404 | ORDER_NOT_FOUND | Missing order |

## Out of scope

- Listing / publishing products via REST
- Multipart / base64 image upload on REST (use image URLs instead)
- Creating new variants after product create
- GraphQL / admin JWT flows for these integrations

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
