const DEFAULT_SERVER_GRAPHQL_URL = 'http://localhost:3002/graphql';
const DEFAULT_API_BASE_URL = 'http://localhost:3002';

/** Browser: same-origin proxy (/graphql). SSR: direct backend URL. */
export const GRAPHQL_URL =
  typeof window === 'undefined'
    ? (process.env.GRAPHQL_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_URL)
    : (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/graphql');

/** Direct REST API base URL (no trailing slash). Vendor public API is not proxied like GraphQL. */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    const ssrGraphqlUrl = process.env.GRAPHQL_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_URL;
    return ssrGraphqlUrl.replace(/\/graphql\/?$/, '') || DEFAULT_API_BASE_URL;
  }

  return DEFAULT_API_BASE_URL;
}

export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';

export const COOKIE_NAMES = {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
} as const;

export const ACCESS_TOKEN_MAX_AGE_DAYS = 1 / 24;
export const REFRESH_TOKEN_MAX_AGE_DAYS = 7;

export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const PRODUCT_STATUSES = ['draft', 'published', 'archived'] as const;
