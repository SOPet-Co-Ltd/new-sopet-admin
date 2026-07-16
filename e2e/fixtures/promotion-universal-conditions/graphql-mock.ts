/**
 * Playwright GraphQL mocks for Promotion Universal Conditions admin/vendor create journey.
 *
 * Platform PRODUCTS_QUERY: `storeId` is optional — do not require it on the mock boundary.
 * Vendor path: VendorProducts (implicit store scope) or Products with storeId filter.
 *
 * Auth (document for journeys — reuse taxonomy helpers):
 * - Admin: `authenticateAsAdmin(page)` from `e2e/fixtures/taxonomy/admin-auth`
 * - Vendor: `authenticateAsVendor(page)` + localStorage `sopet-vendor-store` activeStoreId
 * Storefront guest vs logged-in auth is documented in storefront fixtures (useAuth mocks),
 * not in this Playwright admin harness.
 */
import type { Page, Route } from '@playwright/test';
import { fulfillGraphQL, getGraphQLOperation } from '../graphql-route';
import {
  PROMOTION_UC_VENDOR_STORE_ID,
  platformPublishedProduct,
  productsPagination,
  sampleCreatedPromotion,
  vendorStoreScopedProduct,
  type PromotionConditionsPayload,
} from './data';

type GraphQLBody = {
  operationName?: string;
  query?: string;
  variables?: Record<string, unknown>;
};

export type CreatePromotionCapture = {
  input: Record<string, unknown> | null;
  conditionsRaw: string | null;
  conditionsParsed: PromotionConditionsPayload | null;
};

export type PromotionUcMockOptions = {
  /** When true, Products responses filter/require storeId (vendor-style). Default false = platform. */
  vendorStoreScoped?: boolean;
  /** Store id used when vendorStoreScoped and filtering Products by storeId. */
  vendorStoreId?: string;
  onCreatePromotion?: (capture: CreatePromotionCapture) => void;
};

function parseConditions(raw: unknown): PromotionConditionsPayload | null {
  if (typeof raw !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    return parsed as PromotionConditionsPayload;
  } catch {
    return null;
  }
}

function platformProductsPayload() {
  return {
    products: {
      items: [platformPublishedProduct],
      pagination: productsPagination,
    },
  };
}

function vendorProductsPayload() {
  return {
    vendorProducts: {
      items: [vendorStoreScopedProduct],
      pagination: productsPagination,
    },
  };
}

function productsPayloadForVariables(
  variables: Record<string, unknown> | undefined,
  options: PromotionUcMockOptions,
) {
  if (options.vendorStoreScoped) {
    const storeId = options.vendorStoreId ?? PROMOTION_UC_VENDOR_STORE_ID;
    // Vendor-style: only return store-scoped items when storeId matches (or VendorProducts op).
    if (variables?.storeId != null && variables.storeId !== storeId) {
      return {
        products: {
          items: [],
          pagination: { ...productsPagination, total: 0, totalPages: 0 },
        },
      };
    }
    return {
      products: {
        items: [vendorStoreScopedProduct],
        pagination: productsPagination,
      },
    };
  }

  // Platform: storeId not required — return global catalog even when storeId omitted.
  return platformProductsPayload();
}

export function resolvePromotionUcOperation(
  operation: string | undefined,
  body: GraphQLBody,
  options: PromotionUcMockOptions = {},
): Record<string, unknown> | null {
  const query = body.query ?? '';

  if (operation === 'Products' || query.includes('products(')) {
    return productsPayloadForVariables(body.variables, options);
  }

  if (operation === 'VendorProducts' || query.includes('vendorProducts(')) {
    return vendorProductsPayload();
  }

  if (operation === 'CreatePromotion' || query.includes('createPromotion')) {
    const input =
      body.variables && typeof body.variables.input === 'object' && body.variables.input !== null
        ? (body.variables.input as Record<string, unknown>)
        : null;
    const conditionsRaw = typeof input?.conditions === 'string' ? input.conditions : null;
    const capture: CreatePromotionCapture = {
      input,
      conditionsRaw,
      conditionsParsed: parseConditions(conditionsRaw),
    };
    options.onCreatePromotion?.(capture);

    return {
      createPromotion: {
        ...sampleCreatedPromotion,
        ...(conditionsRaw ? { conditions: conditionsRaw } : {}),
        ...(typeof input?.code === 'string' ? { code: input.code } : {}),
        ...(typeof input?.name === 'string' ? { name: input.name } : {}),
        ...(typeof input?.type === 'string' ? { type: input.type } : {}),
      },
    };
  }

  if (
    operation === 'PlatformPromotions' ||
    operation === 'StorePromotions' ||
    query.includes('platformPromotions') ||
    query.includes('storePromotions')
  ) {
    // Minimal list stub so post-create navigation does not hang; chips asserted in later tasks.
    return {
      platformPromotions: {
        items: [sampleCreatedPromotion],
        pagination: productsPagination,
      },
      storePromotions: {
        items: [
          {
            ...sampleCreatedPromotion,
            scope: 'store',
            storeId: options.vendorStoreId ?? PROMOTION_UC_VENDOR_STORE_ID,
          },
        ],
        pagination: productsPagination,
      },
    };
  }

  return null;
}

/**
 * Assert helpers for platform vs vendor product mock contracts (unit/shape checks in Phase 0).
 */
export function platformProductsMockRequiresStoreId(): boolean {
  return false;
}

export function vendorProductsMockIsStoreScoped(): boolean {
  return true;
}

export async function installPromotionUniversalConditionsGraphQLMocks(
  page: Page,
  options: PromotionUcMockOptions = {},
) {
  await page.route('**/graphql', async (route: Route) => {
    const body = (route.request().postDataJSON() ?? {}) as GraphQLBody;
    const operation = getGraphQLOperation(body);
    const data = resolvePromotionUcOperation(operation, body, options);
    await fulfillGraphQL(route, data ?? {});
  });
}
