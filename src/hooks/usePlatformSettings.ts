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
  getLoginPageImages,
  loginImagesFormToUpdateInput,
  reorderPlatformBanners,
  reorderPlatformSponsors,
  updateLoginPageImages,
  updatePlatformAd,
  updatePlatformBanner,
  updatePlatformSponsor,
} from '@/lib/api/platform';
import { queryKeys } from '@/lib/react-query/keys';
import type { LoginImagesFormValues } from '@/lib/validations';
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
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
    },
  });
}

export function useUpdatePlatformBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlatformBannerInput) => updatePlatformBanner(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
    },
  });
}

export function useDeletePlatformBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
    },
  });
}

export function useReorderPlatformBanners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderPlatformBanners(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.banners() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
    },
  });
}

export function useUpdatePlatformSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlatformSponsorInput) => updatePlatformSponsor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
    },
  });
}

export function useDeletePlatformSponsor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformSponsor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
    },
  });
}

export function useReorderPlatformSponsors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reorderPlatformSponsors(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.sponsors() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.ads() });
    },
  });
}

export function useUpdatePlatformAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePlatformAdInput) => updatePlatformAd(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.ads() });
    },
  });
}

export function useDeletePlatformAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.ads() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.loginPageImages() });
    },
  });
}

export function useClearLoginPageDesktopImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearLoginPageDesktopImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.loginPageImages() });
    },
  });
}

export function useClearLoginPageMobileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearLoginPageMobileImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.platform.loginPageImages() });
    },
  });
}
