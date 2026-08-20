'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyStore,
  linkStoreOmiseRecipient,
  updateStore,
  updateStorePayout,
} from '@/lib/api/stores';
import { changePassword, updateUserProfile } from '@/lib/api/users';
import { fetchAuthSession, refreshViaBff } from '@/lib/auth/client-session';
import { queryKeys } from '@/lib/react-query/keys';
import { useAuthStore } from '@/stores/auth.store';
import type { UpdateStoreInput } from '@/types';

export function useMyStore() {
  return useQuery({
    staleTime: 2 * 60 * 1000, // Store settings change occasionally
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
    onSuccess: (store) => {
      queryClient.setQueryData(queryKeys.stores.detail('current'), store);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}

export function useLinkStoreOmiseRecipient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: linkStoreOmiseRecipient,
    onSuccess: (store) => {
      queryClient.setQueryData(queryKeys.stores.detail('current'), store);
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
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
    onSuccess: async () => {
      // Re-issue JWT so mustChangePassword claim clears (admin refresh re-reads DB).
      await refreshViaBff();
      const session = await fetchAuthSession();
      const current = useAuthStore.getState().user;
      if (!current) {
        return;
      }
      useAuthStore.getState().setUser({
        ...current,
        role: session.role ?? current.role,
        storeId: session.storeId ?? current.storeId,
        // Always clear after a successful changePassword — vendor refresh may keep a stale claim.
        mustChangePassword: false,
      });
    },
  });
}
