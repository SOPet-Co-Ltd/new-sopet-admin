export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3002/graphql';

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
