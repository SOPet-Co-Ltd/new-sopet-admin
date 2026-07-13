import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_STORE_QUERY,
  ADMIN_STORES_QUERY,
  CREATE_STORE_AS_ADMIN,
  UPDATE_STORE_AS_ADMIN,
} from '@/lib/graphql/documents';
import { mapAdminStore } from '@/lib/graphql/mappers';
import type { AdminStore, CreateStoreAsAdminInput, UpdateStoreAsAdminInput } from '@/types';
import type { AdminStoreFormValues } from '@/lib/validations';

type GqlAdminStore = Parameters<typeof mapAdminStore>[0];

export function buildCreateStoreAsAdminInput(
  values: AdminStoreFormValues,
): CreateStoreAsAdminInput {
  return {
    ownerUserId: values.ownerId,
    name: values.name,
    description: values.description || undefined,
    contactPhone: values.contactPhone || undefined,
    contactEmail: values.contactEmail || undefined,
    address: values.address || undefined,
  };
}

export function buildUpdateStoreAsAdminInput(
  values: AdminStoreFormValues,
): UpdateStoreAsAdminInput {
  return {
    name: values.name,
    slug: values.slug || undefined,
    description: values.description || undefined,
    status: values.status,
    contactPhone: values.contactPhone || undefined,
    contactEmail: values.contactEmail || undefined,
    address: values.address || undefined,
    ownerId: values.ownerId ? values.ownerId : null,
  };
}

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
