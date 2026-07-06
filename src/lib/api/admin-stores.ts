import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_STORE_QUERY,
  ADMIN_STORES_QUERY,
  CREATE_STORE_AS_ADMIN,
  UPDATE_STORE_AS_ADMIN,
} from '@/lib/graphql/documents';
import { mapAdminStore } from '@/lib/graphql/mappers';
import type { AdminStore, CreateStoreAsAdminInput, UpdateStoreAsAdminInput } from '@/types';

type GqlAdminStore = Parameters<typeof mapAdminStore>[0];

export function getAdminStores(): Promise<AdminStore[]> {
  return executeQuery<{ adminStores: GqlAdminStore[] }>(ADMIN_STORES_QUERY).then((data) =>
    data.adminStores.map(mapAdminStore),
  );
}

export function getAdminStore(id: string): Promise<AdminStore> {
  return executeQuery<{ adminStore: GqlAdminStore }>(ADMIN_STORE_QUERY, { id }).then((data) =>
    mapAdminStore(data.adminStore),
  );
}

export function createStoreAsAdmin(input: CreateStoreAsAdminInput): Promise<AdminStore> {
  return executeMutation<{ createStoreAsAdmin: GqlAdminStore }>(CREATE_STORE_AS_ADMIN, {
    input,
  }).then((data) => mapAdminStore(data.createStoreAsAdmin));
}

export function updateStoreAsAdmin(
  id: string,
  input: UpdateStoreAsAdminInput,
): Promise<AdminStore> {
  return executeMutation<{ updateStoreAsAdmin: GqlAdminStore }>(UPDATE_STORE_AS_ADMIN, {
    input: { id, ...input },
  }).then((data) => mapAdminStore(data.updateStoreAsAdmin));
}
