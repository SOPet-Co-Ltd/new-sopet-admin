'use client';

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  approveCategory,
  approveTag,
  approvePetType,
  approveBrand,
  createCategory,
  createTag,
  createPetType,
  createBrand,
  deleteCategory,
  deleteTag,
  deletePetType,
  deleteBrand,
  getApprovedCategories,
  getApprovedTags,
  getApprovedPetTypes,
  getApprovedBrands,
  getCategoryDeleteImpact,
  getTagDeleteImpact,
  getPetTypeDeleteImpact,
  getBrandDeleteImpact,
  getMyCategoryProposals,
  getMyTagProposals,
  getPendingCategories,
  getPendingTags,
  getPendingPetTypes,
  getPendingBrands,
  getRejectedCategories,
  getRejectedTags,
  rejectCategory,
  rejectTag,
  rejectPetType,
  rejectBrand,
  setCategoryImage,
  setPetTypeImage,
  updateCategory,
  updatePetType,
} from '@/lib/api/taxonomy';
import { queryKeys } from '@/lib/react-query/keys';
import type {
  CreateCategoryInput,
  CreatePetTypeInput,
  DeleteCategoryInput,
  DeletePetTypeInput,
  DeleteBrandInput,
  SetCategoryImageInput,
  SetPetTypeImageInput,
  UpdateCategoryInput,
  UpdatePetTypeInput,
} from '@/types';

const TAXONOMY_STALE_TIME = 5 * 60 * 1000; // Taxonomy rarely changes

type QueryKeyFactory = () => readonly unknown[];

function invalidateTaxonomyKeys(queryClient: QueryClient, keys: QueryKeyFactory[]) {
  for (const keyFactory of keys) {
    void queryClient.invalidateQueries({ queryKey: keyFactory() });
  }
}

export function useApprovedCategories() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.approvedCategories(),
    queryFn: getApprovedCategories,
  });
}

export function useApprovedTags() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.approvedTags(),
    queryFn: getApprovedTags,
  });
}

export function useApprovedPetTypes() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.approvedPetTypes(),
    queryFn: getApprovedPetTypes,
  });
}

export function useApprovedBrands() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.approvedBrands(),
    queryFn: getApprovedBrands,
  });
}

export function usePendingCategories() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.pendingCategories(),
    queryFn: getPendingCategories,
  });
}

export function usePendingTags() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.pendingTags(),
    queryFn: getPendingTags,
  });
}

export function usePendingPetTypes() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.pendingPetTypes(),
    queryFn: getPendingPetTypes,
  });
}

export function usePendingBrands() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.pendingBrands(),
    queryFn: getPendingBrands,
  });
}

export function useRejectedCategories() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.rejectedCategories(),
    queryFn: getRejectedCategories,
  });
}

export function useRejectedTags() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.rejectedTags(),
    queryFn: getRejectedTags,
  });
}

export function useMyCategoryProposals() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.myCategoryProposals(),
    queryFn: getMyCategoryProposals,
  });
}

export function useMyTagProposals() {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.myTagProposals(),
    queryFn: getMyTagProposals,
  });
}

export function useCategoryDeleteImpact(categoryId: string, enabled = true) {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.categoryDeleteImpact(categoryId),
    queryFn: () => getCategoryDeleteImpact(categoryId),
    enabled: enabled && !!categoryId,
  });
}

export function useTagDeleteImpact(tagId: string, enabled = true) {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.tagDeleteImpact(tagId),
    queryFn: () => getTagDeleteImpact(tagId),
    enabled: enabled && !!tagId,
  });
}

export function usePetTypeDeleteImpact(petTypeId: string, enabled = true) {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.petTypeDeleteImpact(petTypeId),
    queryFn: () => getPetTypeDeleteImpact(petTypeId),
    enabled: enabled && !!petTypeId,
  });
}

export function useBrandDeleteImpact(brandId: string, enabled = true) {
  return useQuery({
    staleTime: TAXONOMY_STALE_TIME,
    queryKey: queryKeys.taxonomy.brandDeleteImpact(brandId),
    queryFn: () => getBrandDeleteImpact(brandId),
    enabled: enabled && !!brandId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedCategories,
        queryKeys.taxonomy.pendingCategories,
        queryKeys.taxonomy.myCategoryProposals,
      ]);
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedTags,
        queryKeys.taxonomy.pendingTags,
        queryKeys.taxonomy.myTagProposals,
      ]);
    },
  });
}

export function useCreatePetType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePetTypeInput) => createPetType(input),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedPetTypes,
        queryKeys.taxonomy.pendingPetTypes,
      ]);
    },
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createBrand(name),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedBrands,
        queryKeys.taxonomy.pendingBrands,
      ]);
    },
  });
}

export function useSetCategoryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetCategoryImageInput) => setCategoryImage(input),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedCategories,
        queryKeys.taxonomy.pendingCategories,
      ]);
    },
  });
}

export function useSetPetTypeImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SetPetTypeImageInput) => setPetTypeImage(input),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedPetTypes,
        queryKeys.taxonomy.pendingPetTypes,
      ]);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategory(input),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedCategories,
        queryKeys.taxonomy.pendingCategories,
      ]);
    },
  });
}

export function useUpdatePetType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePetTypeInput) => updatePetType(input),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedPetTypes,
        queryKeys.taxonomy.pendingPetTypes,
      ]);
    },
  });
}

export function useApproveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveCategory(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedCategories,
        queryKeys.taxonomy.pendingCategories,
        queryKeys.taxonomy.rejectedCategories,
      ]);
    },
  });
}

export function useRejectCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectCategory(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.pendingCategories,
        queryKeys.taxonomy.rejectedCategories,
      ]);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteCategoryInput) => deleteCategory(input),
    onSuccess: (_data, variables) => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedCategories,
        queryKeys.taxonomy.pendingCategories,
        queryKeys.taxonomy.rejectedCategories,
        () => queryKeys.taxonomy.categoryDeleteImpact(variables.id),
      ]);
    },
  });
}

export function useApproveTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveTag(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedTags,
        queryKeys.taxonomy.pendingTags,
        queryKeys.taxonomy.rejectedTags,
      ]);
    },
  });
}

export function useRejectTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectTag(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.pendingTags,
        queryKeys.taxonomy.rejectedTags,
      ]);
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: (_data, id) => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedTags,
        queryKeys.taxonomy.pendingTags,
        queryKeys.taxonomy.rejectedTags,
        () => queryKeys.taxonomy.tagDeleteImpact(id),
      ]);
    },
  });
}

export function useDeletePetType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeletePetTypeInput) => deletePetType(input),
    onSuccess: (_data, variables) => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedPetTypes,
        queryKeys.taxonomy.pendingPetTypes,
        () => queryKeys.taxonomy.petTypeDeleteImpact(variables.id),
      ]);
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteBrandInput) => deleteBrand(input),
    onSuccess: (_data, variables) => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedBrands,
        queryKeys.taxonomy.pendingBrands,
        () => queryKeys.taxonomy.brandDeleteImpact(variables.id),
      ]);
    },
  });
}

export function useApprovePetType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvePetType(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedPetTypes,
        queryKeys.taxonomy.pendingPetTypes,
      ]);
    },
  });
}

export function useRejectPetType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectPetType(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [queryKeys.taxonomy.pendingPetTypes]);
    },
  });
}

export function useApproveBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveBrand(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [
        queryKeys.taxonomy.approvedBrands,
        queryKeys.taxonomy.pendingBrands,
      ]);
    },
  });
}

export function useRejectBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectBrand(id),
    onSuccess: () => {
      invalidateTaxonomyKeys(queryClient, [queryKeys.taxonomy.pendingBrands]);
    },
  });
}
