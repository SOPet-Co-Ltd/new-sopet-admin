const DEFAULT_SERVER_GRAPHQL_URL = 'http://localhost:3002/graphql';
const DEFAULT_SERVER_GRAPHQL_WS_URL = 'ws://localhost:3002/graphql';
const DEFAULT_API_BASE_URL = 'http://localhost:3002';
const DEFAULT_BROWSER_GRAPHQL_URL = '/graphql';
const DEFAULT_BROWSER_GRAPHQL_WS_ORIGIN = 'http://localhost:3002';

/**
 * Browser GraphQL must stay same-origin (`/graphql` BFF).
 * Absolute URLs are ignored: CSP `connect-src 'self'` blocks them, and HttpOnly
 * auth cookies would not be sent to a different origin.
 */
export function resolveBrowserGraphqlUrl(fromEnv = process.env.NEXT_PUBLIC_GRAPHQL_URL): string {
  if (fromEnv && fromEnv.startsWith('/') && !fromEnv.startsWith('//')) {
    return fromEnv;
  }
  return DEFAULT_BROWSER_GRAPHQL_URL;
}

/** Browser: same-origin proxy (/graphql). SSR: direct backend URL. */
export const GRAPHQL_URL =
  typeof window === 'undefined'
    ? (process.env.GRAPHQL_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_URL)
    : resolveBrowserGraphqlUrl();

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

function originFromGraphqlUrl(graphqlUrl: string): string {
  return graphqlUrl.replace(/\/graphql\/?$/, '') || DEFAULT_API_BASE_URL;
}

function isLocalApiHost(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** Convert an API origin or GraphQL HTTP/WS URL into `ws(s)://host/graphql`. */
export function toGraphqlWsUrl(originOrUrl: string): string {
  const url = new URL(originOrUrl);
  if (url.protocol === 'https:' || url.protocol === 'wss:') {
    url.protocol = 'wss:';
  } else {
    url.protocol = 'ws:';
  }
  url.pathname = '/graphql';
  url.search = '';
  url.hash = '';
  return url.toString();
}

function firstNonLocalCandidate(...candidates: Array<string | undefined>): string | undefined {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && !isLocalApiHost(value)) {
      return value;
    }
  }
  return undefined;
}

/**
 * Browser WebSocket URL for GraphQL subscriptions (direct to API).
 * Prefer an explicit WS URL, then public API hosts. Local fallback is localhost.
 *
 * Deployed builds also inject `NEXT_PUBLIC_GRAPHQL_WS_URL` from `GRAPHQL_SSR_URL`
 * via next.config when the public vars are unset (see next.config.ts).
 */
export function resolveBrowserGraphqlWsUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const explicit = env.NEXT_PUBLIC_GRAPHQL_WS_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const origin =
    firstNonLocalCandidate(
      env.NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN,
      env.NEXT_PUBLIC_API_URL,
      // Server-only; available in tests / SSR. Client builds get this via next.config inject.
      env.GRAPHQL_SSR_URL,
    ) ?? DEFAULT_BROWSER_GRAPHQL_WS_ORIGIN;

  return toGraphqlWsUrl(origin);
}

/** WebSocket endpoint for GraphQL subscriptions (browser connects directly to API). */
export function getGraphqlWsUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.GRAPHQL_WS_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_WS_URL;
  }

  return resolveBrowserGraphqlWsUrl();
}

/** Direct REST API base URL (no trailing slash). Vendor public API is not proxied like GraphQL. */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_API_URL);
  }

  if (typeof window === 'undefined') {
    const ssrGraphqlUrl = process.env.GRAPHQL_SSR_URL ?? DEFAULT_SERVER_GRAPHQL_URL;
    return originFromGraphqlUrl(ssrGraphqlUrl);
  }

  if (process.env.NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN);
  }

  return DEFAULT_API_BASE_URL;
}

/**
 * API base URL safe for vendor docs / public crawler text.
 * Prefer the configured public host; never advertise local/dev backends.
 */
export function resolvePublicApiBaseUrl(): string {
  const url = getApiBaseUrl();
  if (isLocalApiHost(url)) {
    return '{API_BASE_URL}';
  }
  return url;
}

export const ACCESS_TOKEN = 'accessToken';
export const REFRESH_TOKEN = 'refreshToken';
/** Non-secret companion flag so the client knows a session exists without reading JWTs. */
export const AUTH_COMPANION_COOKIE = 'sopet_admin_auth';

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
