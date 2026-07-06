import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  CREATE_STORE_API_KEY,
  REVOKE_STORE_API_KEY,
  STORE_API_KEYS_QUERY,
} from '@/lib/graphql/documents';
import type { CreateStoreApiKeyResult, StoreApiKey } from '@/types/api';

type GqlStoreApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
};

function mapStoreApiKey(key: GqlStoreApiKey): StoreApiKey {
  return {
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt ?? undefined,
    revokedAt: key.revokedAt ?? undefined,
  };
}

export function getStoreApiKeys(storeId: string): Promise<StoreApiKey[]> {
  return executeQuery<{ storeApiKeys: GqlStoreApiKey[] }>(STORE_API_KEYS_QUERY, {
    storeId,
  }).then((data) => data.storeApiKeys.map(mapStoreApiKey));
}

export function createStoreApiKey(storeId: string, name: string): Promise<CreateStoreApiKeyResult> {
  return executeMutation<{
    createStoreApiKey: { apiKey: GqlStoreApiKey; secret: string };
  }>(CREATE_STORE_API_KEY, { storeId, name }).then((data) => ({
    apiKey: mapStoreApiKey(data.createStoreApiKey.apiKey),
    secret: data.createStoreApiKey.secret,
  }));
}

export function revokeStoreApiKey(storeId: string, id: string): Promise<boolean> {
  return executeMutation<{ revokeStoreApiKey: boolean }>(REVOKE_STORE_API_KEY, {
    storeId,
    id,
  }).then((data) => data.revokeStoreApiKey);
}
