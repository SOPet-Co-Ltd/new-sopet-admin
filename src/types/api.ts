export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiMeta {
  timestamp: string;
  pagination?: Pagination;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorMeta {
  timestamp: string;
  path: string;
  method: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiErrorMeta;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorEnvelope;

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface StoreApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
}

export interface CreateStoreApiKeyResult {
  apiKey: StoreApiKey;
  secret: string;
}
