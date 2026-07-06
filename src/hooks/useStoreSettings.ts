'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyStore, updateStore, updateStorePayout } from '@/lib/api/stores';
import { changePassword, updateUserProfile } from '@/lib/api/users';
import { queryKeys } from '@/lib/react-query/keys';
import { useAuthStore } from '@/stores/auth.store';
import type { UpdateStoreInput } from '@/types';

export function useMyStore() {
  return useQuery({
    queryKey: queryKeys.stores.detail('current'),
    queryFn: getMyStore,
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStoreInput) => updateStore(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    },
  });
}

export function useUpdateStorePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Pick<
        UpdateStoreInput,
        'bankAccountName' | 'bankAccountNumber' | 'bankName' | 'bankCode'
      >,
    ) => updateStorePayout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.detail('current') });
    },
  });
}

export function useUpdateUserProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: { fullName?: string }) => updateUserProfile(input),
    onSuccess: (updated) => {
      if (user) {
        setUser({ ...user, fullName: updated.fullName, email: updated.email });
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) => changePassword(input),
  });
}
