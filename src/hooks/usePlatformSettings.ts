'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  clearLoginPageDesktopImage,
  clearLoginPageMobileImage,
  createPlatformAd,
  createPlatformBanner,
  createPlatformSponsor,
  deletePlatformAd,
  deletePlatformBanner,
  deletePlatformSponsor,
  getAllPlatformAds,
  getAllPlatformBanners,
  getAllPlatformSponsors,
  getBankTransferSettings,
  getLoginPageImages,
  loginImagesFormToUpdateInput,
  reorderPlatformBanners,
  reorderPlatformSponsors,
  updateBankTransferDetails,
  updateLoginPageImages,
  updatePlatformAd,
  updatePlatformBanner,
  updatePlatformSponsor,
} from '@/lib/api/platform';
import { queryKeys } from '@/lib/react-query/keys';
import type { BankTransferFormValues, LoginImagesFormValues } from '@/lib/validations';
import type {
  CreatePlatformAdInput,
  CreatePlatformBannerInput,
  CreatePlatformSponsorInput,
  UpdatePlatformAdInput,
  UpdatePlatformBannerInput,
  UpdatePlatformSponsorInput,
} from '@/types';

export function useAllPlatformBanners() {
  return useQuery({
    queryKey: queryKeys.platform.banners(),
    queryFn: getAllPlatformBanners,
  });
}

export function useCreatePlatformBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlatformBannerInput) => createPlatformBanner(input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
    },
  });
}

export function useUpdatePlatformBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlatformBannerInput) => updatePlatformBanner(input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
    },
  });
}

export function useDeletePlatformBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformBanner(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
    },
  });
}

export function useReorderPlatformBanners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderPlatformBanners(ids),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
    },
  });
}

export function useAllPlatformSponsors() {
  return useQuery({
    queryKey: queryKeys.platform.sponsors(),
    queryFn: getAllPlatformSponsors,
  });
}

export function useCreatePlatformSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlatformSponsorInput) => createPlatformSponsor(input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
    },
  });
}

export function useUpdatePlatformSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlatformSponsorInput) => updatePlatformSponsor(input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
    },
  });
}

export function useDeletePlatformSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformSponsor(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
    },
  });
}

export function useReorderPlatformSponsors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderPlatformSponsors(ids),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
    },
  });
}

export function useAllPlatformAds() {
  return useQuery({
    queryKey: queryKeys.platform.ads(),
    queryFn: getAllPlatformAds,
  });
}

export function useCreatePlatformAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlatformAdInput) => createPlatformAd(input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.ads() });
    },
  });
}

export function useUpdatePlatformAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlatformAdInput) => updatePlatformAd(input),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.ads() });
    },
  });
}

export function useDeletePlatformAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformAd(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.ads() });
    },
  });
}

export function useLoginPageImages() {
  return useQuery({
    queryKey: queryKeys.platform.loginPageImages(),
    queryFn: getLoginPageImages,
  });
}

export function useUpdateLoginPageImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: LoginImagesFormValues) =>
      updateLoginPageImages(loginImagesFormToUpdateInput(form)),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.loginPageImages() });
    },
  });
}

export function useClearLoginPageDesktopImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearLoginPageDesktopImage(),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.loginPageImages() });
    },
  });
}

export function useClearLoginPageMobileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearLoginPageMobileImage(),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.loginPageImages() });
    },
  });
}

export function useBankTransferSettings() {
  return useQuery({
    queryKey: queryKeys.platform.bankTransfer(),
    queryFn: getBankTransferSettings,
  });
}

export function useUpdateBankTransferDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: BankTransferFormValues) =>
      updateBankTransferDetails({
        enabled: form.enabled,
        bankName: form.bankName,
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        // Branch is unused on storefront; always clear on save.
        branchName: null,
      }),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.platform.bankTransfer() });
    },
  });
}
