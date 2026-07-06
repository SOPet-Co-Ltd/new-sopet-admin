import { executeQuery } from '@/lib/graphql/client';
import { VENDOR_CUSTOMER_QUERY, VENDOR_CUSTOMERS_QUERY } from '@/lib/graphql/documents';
import { mapVendorCustomer } from '@/lib/graphql/mappers';
import type { CustomersQueryParams, Paginated, VendorCustomer } from '@/types';

type GqlVendorCustomer = Parameters<typeof mapVendorCustomer>[0];

export function getVendorCustomers(
  params: CustomersQueryParams,
): Promise<Paginated<VendorCustomer>> {
  return executeQuery<{
    vendorCustomers: {
      items: GqlVendorCustomer[];
      pagination: Paginated<VendorCustomer>['pagination'];
    };
  }>(VENDOR_CUSTOMERS_QUERY, {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    search: params.search || undefined,
  }).then((data) => ({
    items: data.vendorCustomers.items.map(mapVendorCustomer),
    pagination: data.vendorCustomers.pagination,
  }));
}

export function getVendorCustomer(id: string): Promise<VendorCustomer> {
  return executeQuery<{ vendorCustomer: GqlVendorCustomer }>(VENDOR_CUSTOMER_QUERY, { id }).then(
    (data) => mapVendorCustomer(data.vendorCustomer),
  );
}
