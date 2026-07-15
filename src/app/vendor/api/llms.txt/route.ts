import { NextResponse } from 'next/server';

import { resolvePublicApiBaseUrl } from '@/lib/config';

export const revalidate = 86400;

function buildLlmsTxtContent(adminOrigin: string): string {
  const apiBaseUrl = resolvePublicApiBaseUrl();

  return `# SOPET Vendor Product API

> REST API for approved SOPET stores to create product drafts from external systems (ERP, POS, inventory tools).

> Managed in the vendor dashboard. API keys are store-scoped. Products created via this API are always saved as draft and must be reviewed/published in the vendor UI. Image upload is not supported on this endpoint.

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

Use the UUID Store ID shown at ${adminOrigin}/vendor/api in every request path:

\`/api/v1/stores/{storeId}/products\`

## Endpoints

### Create product (draft)

- Method: \`POST\`
- Path: \`/api/v1/stores/{storeId}/products\`
- Success: \`201\` with the created product object (status \`draft\`)
- Content-Type: \`application/json\`

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
| variants | array | yes | Option groups / dimensions (≥ 1). No sku/stock/price here |
| variantItems | array | yes | Purchasable combinations (≥ 1). Holds sku/stock/price |

#### variants[] fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | string | yes | Dimension name, e.g. "สี" or "ขนาด" |
| values | string[] | yes | Allowed values for that dimension |

#### variantItems[] fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| sku | string | yes | Unique SKU |
| stock | integer | yes | ≥ 0 |
| price | number | yes | THB absolute price ≥ 0 |
| options | object | yes | Map of every variants[].name → one of its values |

#### Important rules

- Two-level model: \`variants\` declare dimensions; \`variantItems\` are sellable combos.
- Product base price is the minimum \`variantItems[].price\` (no \`basePrice\` field).
- Always created as \`draft\` — publish from the vendor dashboard after review.
- No image/media upload on this API.
- category / tags / petType / brand must already exist and be approved; unknown names return 400.
- Name matching for those fields is case-insensitive exact match on the display name.

#### Example

\`\`\`json
{
  "name": "อาหารแมวออร์แกนิค 2kg",
  "description": "อาหารแมวเกรดพรีเมียม",
  "warning": "เก็บในที่แห้ง หลีกเลี่ยงแสงแดด",
  "expiryDate": "2026-12-31",
  "category": "อาหารแมว",
  "tags": ["ออร์แกนิค", "เกรดพรีเมียม"],
  "petType": "แมว",
  "brand": "Royal Canin",
  "variants": [
    { "name": "รสชาติ", "values": ["ไก่", "ปลา"] },
    { "name": "ขนาด", "values": ["2kg"] }
  ],
  "variantItems": [
    {
      "sku": "CAT-ORG-2KG-CHK",
      "stock": 120,
      "price": 499,
      "options": { "รสชาติ": "ไก่", "ขนาด": "2kg" }
    },
    {
      "sku": "CAT-ORG-2KG-FISH",
      "stock": 80,
      "price": 519,
      "options": { "รสชาติ": "ปลา", "ขนาด": "2kg" }
    }
  ]
}
\`\`\`

#### Example curl

\`\`\`bash
curl -X POST "${apiBaseUrl}/api/v1/stores/{storeId}/products" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d @product.json
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
| 400 | VALIDATION_ERROR | Request body failed validation |
| 400 | VARIANTS_REQUIRED | Missing/empty variants |
| 400 | VARIANT_ITEMS_REQUIRED | Missing/empty variantItems |
| 400 | INVALID_VARIANT_OPTIONS | options missing a group or using undeclared values |
| 400 | CATEGORY_NOT_FOUND | Unknown or unapproved category name |
| 400 | TAG_NOT_FOUND | Unknown or unapproved tag name(s) |
| 400 | PET_TYPE_NOT_FOUND | Unknown or unapproved pet type name |
| 400 | BRAND_NOT_FOUND | Unknown or unapproved brand name |
| 400 | SKU_EXISTS | SKU already exists |

## Out of scope

- Listing, updating, deleting, or publishing products via REST
- Image upload
- Orders, inventory sync beyond create-draft, GraphQL, or admin JWT flows

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
