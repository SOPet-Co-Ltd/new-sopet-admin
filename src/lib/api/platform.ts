import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ALL_PLATFORM_ADS_QUERY,
  ALL_PLATFORM_BANNERS_QUERY,
  ALL_PLATFORM_SPONSORS_QUERY,
  CLEAR_LOGIN_PAGE_DESKTOP_IMAGE,
  CLEAR_LOGIN_PAGE_MOBILE_IMAGE,
  CREATE_PLATFORM_AD,
  CREATE_PLATFORM_BANNER,
  CREATE_PLATFORM_SPONSOR,
  DELETE_PLATFORM_AD,
  DELETE_PLATFORM_BANNER,
  DELETE_PLATFORM_SPONSOR,
  LOGIN_PAGE_IMAGES_QUERY,
  REORDER_PLATFORM_BANNERS,
  REORDER_PLATFORM_SPONSORS,
  UPDATE_LOGIN_PAGE_IMAGES,
  UPDATE_PLATFORM_AD,
  UPDATE_PLATFORM_BANNER,
  UPDATE_PLATFORM_SPONSOR,
} from '@/lib/graphql/documents';
import type {
  CreatePlatformAdInput,
  CreatePlatformBannerInput,
  CreatePlatformSponsorInput,
  LoginPageImages,
  PlatformAd,
  PlatformBanner,
  PlatformSponsor,
  UpdateLoginPageImagesInput,
  UpdatePlatformAdInput,
  UpdatePlatformBannerInput,
  UpdatePlatformSponsorInput,
} from '@/types';
import type { LoginImagesFormValues } from '@/lib/validations';

function mapBanner(raw: PlatformBanner): PlatformBanner {
  return {
    id: raw.id,
    title: raw.title,
    imageUrl: raw.imageUrl,
    mobileImageUrl: raw.mobileImageUrl ?? null,
    linkUrl: raw.linkUrl,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
  };
}

function mapSponsor(raw: PlatformSponsor): PlatformSponsor {
  return {
    id: raw.id,
    name: raw.name,
    imageUrl: raw.imageUrl,
    linkUrl: raw.linkUrl,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
  };
}

function mapAd(raw: PlatformAd): PlatformAd {
  return {
    id: raw.id,
    title: raw.title,
    imageUrl: raw.imageUrl,
    linkUrl: raw.linkUrl,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
  };
}

export function getAllPlatformBanners(): Promise<PlatformBanner[]> {
  return executeQuery<{ allPlatformBanners: PlatformBanner[] }>(ALL_PLATFORM_BANNERS_QUERY).then(
    (data) => data.allPlatformBanners.map(mapBanner),
  );
}

export function createPlatformBanner(input: CreatePlatformBannerInput): Promise<PlatformBanner> {
  return executeMutation<{ createPlatformBanner: PlatformBanner }>(CREATE_PLATFORM_BANNER, {
    input,
  }).then((data) => mapBanner(data.createPlatformBanner));
}

export function updatePlatformBanner(input: UpdatePlatformBannerInput): Promise<PlatformBanner> {
  return executeMutation<{ updatePlatformBanner: PlatformBanner }>(UPDATE_PLATFORM_BANNER, {
    input,
  }).then((data) => mapBanner(data.updatePlatformBanner));
}

export function deletePlatformBanner(id: string): Promise<boolean> {
  return executeMutation<{ deletePlatformBanner: boolean }>(DELETE_PLATFORM_BANNER, { id }).then(
    (data) => data.deletePlatformBanner,
  );
}

export function reorderPlatformBanners(ids: string[]): Promise<PlatformBanner[]> {
  return executeMutation<{ reorderPlatformBanners: PlatformBanner[] }>(REORDER_PLATFORM_BANNERS, {
    ids,
  }).then((data) => data.reorderPlatformBanners.map(mapBanner));
}

export function getAllPlatformSponsors(): Promise<PlatformSponsor[]> {
  return executeQuery<{ allPlatformSponsors: PlatformSponsor[] }>(ALL_PLATFORM_SPONSORS_QUERY).then(
    (data) => data.allPlatformSponsors.map(mapSponsor),
  );
}

export function createPlatformSponsor(input: CreatePlatformSponsorInput): Promise<PlatformSponsor> {
  return executeMutation<{ createPlatformSponsor: PlatformSponsor }>(CREATE_PLATFORM_SPONSOR, {
    input,
  }).then((data) => mapSponsor(data.createPlatformSponsor));
}

export function updatePlatformSponsor(input: UpdatePlatformSponsorInput): Promise<PlatformSponsor> {
  return executeMutation<{ updatePlatformSponsor: PlatformSponsor }>(UPDATE_PLATFORM_SPONSOR, {
    input,
  }).then((data) => mapSponsor(data.updatePlatformSponsor));
}

export function deletePlatformSponsor(id: string): Promise<boolean> {
  return executeMutation<{ deletePlatformSponsor: boolean }>(DELETE_PLATFORM_SPONSOR, { id }).then(
    (data) => data.deletePlatformSponsor,
  );
}

export function reorderPlatformSponsors(ids: string[]): Promise<PlatformSponsor[]> {
  return executeMutation<{ reorderPlatformSponsors: PlatformSponsor[] }>(
    REORDER_PLATFORM_SPONSORS,
    { ids },
  ).then((data) => data.reorderPlatformSponsors.map(mapSponsor));
}

export function getAllPlatformAds(): Promise<PlatformAd[]> {
  return executeQuery<{ allPlatformAds: PlatformAd[] }>(ALL_PLATFORM_ADS_QUERY).then((data) =>
    data.allPlatformAds.map(mapAd),
  );
}

export function createPlatformAd(input: CreatePlatformAdInput): Promise<PlatformAd> {
  return executeMutation<{ createPlatformAd: PlatformAd }>(CREATE_PLATFORM_AD, {
    input,
  }).then((data) => mapAd(data.createPlatformAd));
}

export function updatePlatformAd(input: UpdatePlatformAdInput): Promise<PlatformAd> {
  return executeMutation<{ updatePlatformAd: PlatformAd }>(UPDATE_PLATFORM_AD, {
    input,
  }).then((data) => mapAd(data.updatePlatformAd));
}

export function deletePlatformAd(id: string): Promise<boolean> {
  return executeMutation<{ deletePlatformAd: boolean }>(DELETE_PLATFORM_AD, { id }).then(
    (data) => data.deletePlatformAd,
  );
}

function mapLoginPageImages(raw: LoginPageImages): LoginPageImages {
  return {
    desktopImageUrl: raw.desktopImageUrl ?? null,
    mobileImageUrl: raw.mobileImageUrl ?? null,
    altText: raw.altText ?? null,
  };
}

/** Query/API nulls → RHF empty strings. */
export function loginPageImagesToFormValues(data: LoginPageImages): LoginImagesFormValues {
  return {
    desktopImageUrl: data.desktopImageUrl ?? '',
    mobileImageUrl: data.mobileImageUrl ?? '',
    altText: data.altText ?? '',
  };
}

/** Form empty strings → GraphQL null for optional mobile/alt; desktop required as-is. */
export function loginImagesFormToUpdateInput(
  form: LoginImagesFormValues,
): UpdateLoginPageImagesInput {
  return {
    desktopImageUrl: form.desktopImageUrl,
    mobileImageUrl: form.mobileImageUrl === '' ? null : form.mobileImageUrl,
    altText: form.altText === '' ? null : form.altText,
  };
}

export function getLoginPageImages(): Promise<LoginPageImages> {
  return executeQuery<{ loginPageImages: LoginPageImages }>(LOGIN_PAGE_IMAGES_QUERY).then((data) =>
    mapLoginPageImages(data.loginPageImages),
  );
}

export function updateLoginPageImages(input: UpdateLoginPageImagesInput): Promise<LoginPageImages> {
  return executeMutation<{ updateLoginPageImages: LoginPageImages }>(UPDATE_LOGIN_PAGE_IMAGES, {
    input: {
      desktopImageUrl: input.desktopImageUrl,
      mobileImageUrl: input.mobileImageUrl === '' ? null : (input.mobileImageUrl ?? null),
      altText: input.altText === '' ? null : (input.altText ?? null),
    },
  }).then((data) => mapLoginPageImages(data.updateLoginPageImages));
}

export function clearLoginPageDesktopImage(): Promise<LoginPageImages> {
  return executeMutation<{ clearLoginPageDesktopImage: LoginPageImages }>(
    CLEAR_LOGIN_PAGE_DESKTOP_IMAGE,
  ).then((data) => mapLoginPageImages(data.clearLoginPageDesktopImage));
}

export function clearLoginPageMobileImage(): Promise<LoginPageImages> {
  return executeMutation<{ clearLoginPageMobileImage: LoginPageImages }>(
    CLEAR_LOGIN_PAGE_MOBILE_IMAGE,
  ).then((data) => mapLoginPageImages(data.clearLoginPageMobileImage));
}
