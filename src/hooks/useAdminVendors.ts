'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminVendor, getAdminVendors, updateVendorAsAdmin } from '@/lib/api/admin-vendors';
import { queryKeys } from '@/lib/react-query/keys';
import type { UpdateVendorAsAdminInput } from '@/types';

export function useAdminVendors(search?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminVendors.list(search),
    queryFn: () => getAdminVendors(search),
    enabled: options?.enabled ?? true,
  });
}

export function useAdminVendor(id: string) {
  return useQuery({
    queryKey: queryKeys.adminVendors.detail(id),
    queryFn: () => getAdminVendor(id),
    enabled: !!id,
  });
}

export function useUpdateVendorAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVendorAsAdminInput }) =>
      updateVendorAsAdmin(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVendors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVendors.detail(variables.id) });
    },
  });
}
