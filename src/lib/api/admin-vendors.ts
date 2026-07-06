import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_VENDOR_QUERY,
  ADMIN_VENDORS_QUERY,
  UPDATE_VENDOR_AS_ADMIN,
} from '@/lib/graphql/documents';
import { mapAdminVendor } from '@/lib/graphql/mappers';
import type { AdminVendor, UpdateVendorAsAdminInput } from '@/types';

type GqlAdminVendor = Parameters<typeof mapAdminVendor>[0];

export function getAdminVendors(search?: string): Promise<AdminVendor[]> {
  return executeQuery<{ adminVendors: GqlAdminVendor[] }>(ADMIN_VENDORS_QUERY, {
    search: search || undefined,
  }).then((data) => data.adminVendors.map(mapAdminVendor));
}

export function getAdminVendor(id: string): Promise<AdminVendor> {
  return executeQuery<{ adminVendor: GqlAdminVendor }>(ADMIN_VENDOR_QUERY, { id }).then((data) =>
    mapAdminVendor(data.adminVendor),
  );
}

export function updateVendorAsAdmin(
  id: string,
  input: UpdateVendorAsAdminInput,
): Promise<AdminVendor> {
  return executeMutation<{ updateVendorAsAdmin: GqlAdminVendor }>(UPDATE_VENDOR_AS_ADMIN, {
    input: { id, ...input },
  }).then((data) => mapAdminVendor(data.updateVendorAsAdmin));
}
