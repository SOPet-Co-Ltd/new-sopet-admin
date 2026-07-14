'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCooldown } from '@/hooks/useCooldown';
import {
  adminResendVendorEmailVerification,
  adminVerifyVendorEmail,
  getAdminVendor,
  getAdminVendorDetail,
  getAdminVendors,
  updateVendorAsAdmin,
} from '@/lib/api/admin-vendors';
import {
  EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
  getResendEmailVerificationButtonLabel,
} from '@/lib/email-verification/resend';
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

export function useAdminVendorDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.adminVendors.detailInsights(id),
    queryFn: () => getAdminVendorDetail(id),
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminVendors.detailInsights(variables.id),
      });
    },
  });
}

export function useAdminResendVendorEmailVerification() {
  const queryClient = useQueryClient();
  const { isCooldown, remainingSeconds, startCooldown } = useCooldown(
    EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS,
  );
  const mutation = useMutation({
    mutationFn: (vendorId: string) => adminResendVendorEmailVerification(vendorId),
    onSuccess: (_data, vendorId) => {
      startCooldown();
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVendors.detailInsights(vendorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVendors.detail(vendorId) });
    },
  });

  return {
    ...mutation,
    isCooldown,
    cooldownSeconds: remainingSeconds,
    isResendDisabled: mutation.isPending || isCooldown,
    resendButtonLabel: getResendEmailVerificationButtonLabel({
      isPending: mutation.isPending,
      isCooldown,
      cooldownSeconds: remainingSeconds,
    }),
  };
}

export function useAdminVerifyVendorEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) => adminVerifyVendorEmail(vendorId),
    onSuccess: (_data, vendorId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVendors.detailInsights(vendorId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVendors.detail(vendorId) });
    },
  });
}
