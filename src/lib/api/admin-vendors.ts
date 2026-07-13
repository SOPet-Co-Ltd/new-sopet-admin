import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ADMIN_RESEND_VENDOR_EMAIL_VERIFICATION,
  ADMIN_VENDOR_DETAIL_QUERY,
  ADMIN_VENDOR_QUERY,
  ADMIN_VENDORS_QUERY,
  ADMIN_VERIFY_VENDOR_EMAIL,
  UPDATE_VENDOR_AS_ADMIN,
} from '@/lib/graphql/documents';
import { mapAdminVendor, mapAdminVendorDetail } from '@/lib/graphql/mappers';
import type { AdminVendor, AdminVendorDetail, UpdateVendorAsAdminInput } from '@/types';

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

export function getAdminVendorDetail(id: string): Promise<AdminVendorDetail> {
  return executeQuery<{ adminVendorDetail: Parameters<typeof mapAdminVendorDetail>[0] }>(
    ADMIN_VENDOR_DETAIL_QUERY,
    { id },
  ).then((data) => mapAdminVendorDetail(data.adminVendorDetail));
}

export function updateVendorAsAdmin(
  id: string,
  input: UpdateVendorAsAdminInput,
): Promise<AdminVendor> {
  return executeMutation<{ updateVendorAsAdmin: GqlAdminVendor }>(UPDATE_VENDOR_AS_ADMIN, {
    input: { id, ...input },
  }).then((data) => mapAdminVendor(data.updateVendorAsAdmin));
}

export function adminResendVendorEmailVerification(vendorId: string): Promise<string> {
  return executeMutation<{ adminResendVendorEmailVerification: { message: string } }>(
    ADMIN_RESEND_VENDOR_EMAIL_VERIFICATION,
    { vendorId },
  ).then((data) => data.adminResendVendorEmailVerification.message);
}

export function adminVerifyVendorEmail(vendorId: string): Promise<string> {
  return executeMutation<{ adminVerifyVendorEmail: { message: string } }>(
    ADMIN_VERIFY_VENDOR_EMAIL,
    { vendorId },
  ).then((data) => data.adminVerifyVendorEmail.message);
}
