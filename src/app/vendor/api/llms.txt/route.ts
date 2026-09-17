import { NextResponse } from 'next/server';

import { resolvePublicApiBaseUrl } from '@/lib/config';

export const revalidate = 86400;

function buildLlmsTxtContent(adminOrigin: string): string {
  const apiBaseUrl = resolvePublicApiBaseUrl();

  return `# SOPET Vendor API

> REST for approved stores: products (CRUD drafts), live orders/webhooks/tracking, review import/list/delete, and **old-store import** (\`/imported-*\`).

> API keys are store-scoped. Products via this API are always \`draft\` until published in the vendor UI. Image URLs are downloaded into object storage (source URLs are never stored).

> **Import (payout-safe):** \`/imported-customers\`, \`/imported-orders\` write into live \`customers\`/\`orders\` with \`source: vendor_import\`. They do **not** affect payouts, payments, stock, or webhooks. Products return \`soldCount\` (includes import qty).

## Documentation

- Human docs (Thai): ${adminOrigin}/vendor/api/docs
- API keys: ${adminOrigin}/vendor/api
- This file: ${adminOrigin}/vendor/api/llms.txt

## Base URL

${apiBaseUrl}

Replace \`{API_BASE_URL}\` with the SOPET backend origin (no \`/graphql\`). Do not call GraphQL for this integration.

## Authentication

Prefix \`sopet_sk_\`. Create at ${adminOrigin}/vendor/api (manager/owner).

Headers: \`Authorization: Bearer sopet_sk_...\` or \`X-Api-Key: sopet_sk_...\`

Key must match \`{storeId}\`; store must be \`APPROVED\`.

## Store ID

UUID from ${adminOrigin}/vendor/api — use in every \`/api/v1/stores/{storeId}/...\` path.

## Endpoints

### List / get products

- \`GET /api/v1/stores/{storeId}/products\` → \`{ items, pagination }\`; query: \`page\`, \`limit\` (max 100), \`status\` (\`draft\`|\`published\`|\`archived\`), \`search\`
- \`GET /api/v1/stores/{storeId}/products/{productId}\` → product; \`404 PRODUCT_NOT_FOUND\`
- Responses include variants + \`soldCount\`

### Create product (draft)

- Success: \`201\` draft. Response includes product \`id\` and each variant \`id\` — persist these for later GET/PATCH/DELETE.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | string | yes | 1–255 chars |
| description | string | no | |
| warning | string | no | Max 1000 |
| expiryDate | string | no | \`YYYY-MM-DD\` |
| category / tags / petType / brand | string / string[] | no | Approved taxonomy **names** |
| images | string[] | no | Remote URLs max 10; ≤5MB; jpeg/png/webp/gif → WebP storage |
| variants | array | yes | Option groups (≥1); no sku/stock/price |
| variantItems | array | yes | Combinations (≥1) with sku/stock/price/options |

\`variants[].name\` + \`values[]\`; \`variantItems[].sku\`, \`stock\` (≥0), \`price\` (absolute THB), \`options\` map every group → value. basePrice = min(prices); always \`draft\`.

### Update / delete product

- \`PATCH /api/v1/stores/{storeId}/products/{productId}\` — optional \`name\`, \`description\`, \`warning\`, \`expiryDate\`, \`category\`, \`tags\`, \`petType\`, \`brand\`, \`images\` (full replace). Not stock/price/status/variants.
- \`DELETE /api/v1/stores/{storeId}/products/{productId}\` → \`204\` soft delete

### Update variant stock / price

- \`PATCH .../products/{productId}/variants/{variantId}\` or \`PATCH .../variants/by-sku/{sku}\`
- Body: \`stock\` and/or \`price\` (absolute THB); at least one. Stored as \`priceAdjustment = price - basePrice\`.

### Configure order webhook

- \`PUT/GET/DELETE /api/v1/stores/{storeId}/webhook\`
- PUT: \`url\` (HTTPS), \`events?\`, \`enabled?\`, \`rotateSecret?\`
- Outbound: \`POST\` JSON + \`X-Sopet-Event\`, \`X-Sopet-Delivery-Id\`, \`X-Sopet-Signature: sha256=<hmac_hex>\`
- Events: \`order.create\`, \`order.payment_failed\`, \`order.paid\`, \`order.processing\`, \`order.on_hold\`, \`order.shipped\`, \`order.delivered\`, \`order.cancelled\`, \`order.refunded\`

### List orders / tracking

- \`GET /api/v1/stores/{storeId}/orders\` — query: \`page\`, \`limit\`, \`status\`, \`fulfillmentStatus\`, \`updatedSince\`, \`createdSince\`, \`createdUntil\`
- \`PATCH /api/v1/stores/{storeId}/orders/{orderId}/tracking\` — \`trackingNumber\`, \`fulfillmentProvider\`, \`trackingUrl?\`

### Reviews

- \`POST /api/v1/stores/{storeId}/products/{productId}/reviews\` — \`rating\` 1–5, \`comment?\`, \`images?\` (max 5) → \`pending\` / \`vendor_import\` / \`ลูกค้าไม่ระบุชื่อ\` (admin must approve)
- \`GET /api/v1/stores/{storeId}/reviews\` — query: \`page\`, \`limit\`, \`productId\`, \`status\`, \`source\`
- \`DELETE /api/v1/stores/{storeId}/reviews/{reviewId}\` → \`204\` only \`vendor_import\` (\`403 REVIEW_NOT_DELETABLE\`)

### Old-store import (merge into live tables — no payout/stock/webhook)

- \`POST/GET /api/v1/stores/{storeId}/imported-customers\` — \`phone\`, \`fullName\`, \`email?\`, \`externalId?\`; upserts \`customers\` with \`source: vendor_import\`
- \`POST/GET /api/v1/stores/{storeId}/imported-customers/{id}/addresses\` — Thai address fields → \`saved_addresses\`
- \`POST/GET /api/v1/stores/{storeId}/imported-orders\` — \`externalOrderNumber\`, \`placedAt\`, \`customerId?\`, \`items[]\` (\`productName\`, \`quantity\`, \`unitPrice\`, \`productId?\`/\`sku?\`); rows in \`orders\` with \`source: vendor_import\` (excluded from payouts)

## Error responses

\`{ "success": false, "error": { "code", "message" }, "meta": { "timestamp", "path", "method" } }\`

| HTTP | Code |
| --- | --- |
| 401 | INVALID_API_KEY |
| 403 | STORE_SUSPENDED / REVIEW_NOT_DELETABLE |
| 400 | VALIDATION_ERROR / VARIANTS_REQUIRED / VARIANT_ITEMS_REQUIRED / INVALID_VARIANT_OPTIONS / CATEGORY_NOT_FOUND / TAG_NOT_FOUND / PET_TYPE_NOT_FOUND / BRAND_NOT_FOUND / SKU_EXISTS / INVALID_IMAGE_URL / INVALID_IMAGE_TYPE / IMAGE_TOO_LARGE / TOO_MANY_IMAGES / INVALID_WEBHOOK_URL / INVALID_WEBHOOK_EVENT / INVALID_ORDER_STATUS |
| 404 | PRODUCT_NOT_FOUND / VARIANT_NOT_FOUND / WEBHOOK_NOT_FOUND / ORDER_NOT_FOUND / REVIEW_NOT_FOUND / IMPORTED_CUSTOMER_NOT_FOUND |
| 409 | IMPORTED_CUSTOMER_CONFLICT / IMPORTED_ORDER_CONFLICT |

## Out of scope

- Publishing products via REST; multipart/base64 upload; creating variants after create
- Turning imported data into payouts / stock mutations; GraphQL / admin JWT for these integrations

Use ${adminOrigin}/vendor/api/docs for Thai field tables.
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
