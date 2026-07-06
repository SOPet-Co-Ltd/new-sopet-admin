'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorCustomer, getVendorCustomers } from '@/lib/api/vendor-customers';
import { queryKeys } from '@/lib/react-query/keys';
import type { CustomersQueryParams } from '@/types';

export function useVendorCustomers(params: CustomersQueryParams) {
  return useQuery({
    queryKey: queryKeys.vendorCustomers.list(params),
    queryFn: () => getVendorCustomers(params),
  });
}

export function useVendorCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.vendorCustomers.detail(id),
    queryFn: () => getVendorCustomer(id),
    enabled: !!id,
  });
}
