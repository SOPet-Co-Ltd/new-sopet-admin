import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  ApprovedBrandsDocument,
  ApprovedCategoriesDocument,
  ApprovedPetTypesDocument,
  ApprovedTagsDocument,
  ApproveBrandDocument,
  ApproveCategoryDocument,
  ApprovePetTypeDocument,
  ApproveTagDocument,
  BrandDeleteImpactDocument,
  CategoryDeleteImpactDocument,
  CreateBrandDocument,
  CreateCategoryDocument,
  CreatePetTypeDocument,
  CreateTagDocument,
  DeleteBrandDocument,
  DeleteCategoryDocument,
  DeletePetTypeDocument,
  DeleteTagDocument,
  MyCategoryProposalsDocument,
  MyTagProposalsDocument,
  PendingBrandsDocument,
  PendingCategoriesDocument,
  PendingPetTypesDocument,
  PendingTagsDocument,
  PetTypeDeleteImpactDocument,
  RejectCategoryDocument,
  RejectTagDocument,
  RejectedCategoriesDocument,
  RejectedTagsDocument,
  RejectBrandDocument,
  RejectPetTypeDocument,
  SetCategoryImageDocument,
  SetPetTypeImageDocument,
  TagDeleteImpactDocument,
  UpdateCategoryDocument,
  UpdatePetTypeDocument,
  type ApprovedBrandsQuery,
  type ApprovedCategoriesQuery,
  type ApprovedPetTypesQuery,
  type ApprovedTagsQuery,
  type ApproveBrandMutation,
  type ApproveCategoryMutation,
  type ApprovePetTypeMutation,
  type ApproveTagMutation,
  type BrandDeleteImpactQuery,
  type CategoryDeleteImpactQuery,
  type CreateBrandMutation,
  type CreateCategoryMutation,
  type CreatePetTypeMutation,
  type CreateTagMutation,
  type DeleteBrandMutation,
  type DeleteCategoryMutation,
  type DeletePetTypeMutation,
  type DeleteTagMutation,
  type MyCategoryProposalsQuery,
  type MyTagProposalsQuery,
  type PendingBrandsQuery,
  type PendingCategoriesQuery,
  type PendingPetTypesQuery,
  type PendingTagsQuery,
  type PetTypeDeleteImpactQuery,
  type RejectCategoryMutation,
  type RejectTagMutation,
  type RejectedCategoriesQuery,
  type RejectedTagsQuery,
  type RejectBrandMutation,
  type RejectPetTypeMutation,
  type SetCategoryImageMutation,
  type SetPetTypeImageMutation,
  type TagDeleteImpactQuery,
  type UpdateCategoryMutation,
  type UpdatePetTypeMutation,
} from '@/lib/graphql/generated/graphql';
import type {
  CategoryDeleteImpact,
  CreateCategoryInput,
  CreatePetTypeInput,
  DeleteBrandInput,
  DeleteCategoryInput,
  DeleteCategoryResult,
  DeletePetTypeInput,
  DeletePetTypeResult,
  DeleteTagResult,
  DeleteBrandResult,
  SetCategoryImageInput,
  SetPetTypeImageInput,
  TaxonomyDeleteImpact,
  TaxonomyItem,
  UpdateCategoryInput,
  UpdatePetTypeInput,
} from '@/types';

type GqlTaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  approvalStatus: string;
  imageUrl?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
};

const TAXONOMY_MUTATION_OPTIONS = { skipCacheReset: true } as const;

function mapTaxonomyItem(item: GqlTaxonomyItem): TaxonomyItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    status: item.approvalStatus,
    imageUrl: item.imageUrl ?? null,
    proposedBy: item.createdBy ?? undefined,
    createdAt: item.createdAt ?? undefined,
  };
}

export function getApprovedCategories(): Promise<TaxonomyItem[]> {
  return executeQuery<ApprovedCategoriesQuery>(ApprovedCategoriesDocument).then((data) =>
    data.approvedCategories.map(mapTaxonomyItem),
  );
}

export function getApprovedTags(): Promise<TaxonomyItem[]> {
  return executeQuery<ApprovedTagsQuery>(ApprovedTagsDocument).then((data) =>
    data.approvedTags.map(mapTaxonomyItem),
  );
}

export function getPendingCategories(): Promise<TaxonomyItem[]> {
  return executeQuery<PendingCategoriesQuery>(PendingCategoriesDocument).then((data) =>
    data.pendingCategories.map(mapTaxonomyItem),
  );
}

export function getPendingTags(): Promise<TaxonomyItem[]> {
  return executeQuery<PendingTagsQuery>(PendingTagsDocument).then((data) =>
    data.pendingTags.map(mapTaxonomyItem),
  );
}

export function getRejectedCategories(): Promise<TaxonomyItem[]> {
  return executeQuery<RejectedCategoriesQuery>(RejectedCategoriesDocument).then((data) =>
    data.rejectedCategories.map(mapTaxonomyItem),
  );
}

export function getRejectedTags(): Promise<TaxonomyItem[]> {
  return executeQuery<RejectedTagsQuery>(RejectedTagsDocument).then((data) =>
    data.rejectedTags.map(mapTaxonomyItem),
  );
}

export function getMyCategoryProposals(): Promise<TaxonomyItem[]> {
  return executeQuery<MyCategoryProposalsQuery>(MyCategoryProposalsDocument).then((data) =>
    data.myCategoryProposals.map(mapTaxonomyItem),
  );
}

export function getMyTagProposals(): Promise<TaxonomyItem[]> {
  return executeQuery<MyTagProposalsQuery>(MyTagProposalsDocument).then((data) =>
    data.myTagProposals.map(mapTaxonomyItem),
  );
}

export function getCategoryDeleteImpact(categoryId: string): Promise<CategoryDeleteImpact> {
  return executeQuery<CategoryDeleteImpactQuery>(CategoryDeleteImpactDocument, {
    categoryId,
  }).then((data) => data.categoryDeleteImpact);
}

export function getTagDeleteImpact(tagId: string): Promise<TaxonomyDeleteImpact> {
  return executeQuery<TagDeleteImpactQuery>(TagDeleteImpactDocument, { tagId }).then(
    (data) => data.tagDeleteImpact,
  );
}

export function getPetTypeDeleteImpact(petTypeId: string): Promise<TaxonomyDeleteImpact> {
  return executeQuery<PetTypeDeleteImpactQuery>(PetTypeDeleteImpactDocument, {
    petTypeId,
  }).then((data) => data.petTypeDeleteImpact);
}

export function getBrandDeleteImpact(brandId: string): Promise<TaxonomyDeleteImpact> {
  return executeQuery<BrandDeleteImpactQuery>(BrandDeleteImpactDocument, { brandId }).then(
    (data) => data.brandDeleteImpact,
  );
}

export function createCategory(input: CreateCategoryInput): Promise<TaxonomyItem> {
  return executeMutation<CreateCategoryMutation>(
    CreateCategoryDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.createCategory));
}

export function createTag(name: string): Promise<TaxonomyItem> {
  return executeMutation<CreateTagMutation>(
    CreateTagDocument,
    { input: { name } },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.createTag));
}

export function setCategoryImage(input: SetCategoryImageInput): Promise<TaxonomyItem> {
  return executeMutation<SetCategoryImageMutation>(
    SetCategoryImageDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.setCategoryImage));
}

export function updateCategory(input: UpdateCategoryInput): Promise<TaxonomyItem> {
  return executeMutation<UpdateCategoryMutation>(
    UpdateCategoryDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.updateCategory));
}

export function updatePetType(input: UpdatePetTypeInput): Promise<TaxonomyItem> {
  return executeMutation<UpdatePetTypeMutation>(
    UpdatePetTypeDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.updatePetType));
}

export function approveCategory(id: string): Promise<TaxonomyItem> {
  return executeMutation<ApproveCategoryMutation>(
    ApproveCategoryDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.approveCategory));
}

export function rejectCategory(id: string): Promise<TaxonomyItem> {
  return executeMutation<RejectCategoryMutation>(
    RejectCategoryDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.rejectCategory));
}

export function deleteCategory(input: DeleteCategoryInput): Promise<DeleteCategoryResult> {
  return executeMutation<DeleteCategoryMutation>(
    DeleteCategoryDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => data.deleteCategory);
}

export function approveTag(id: string): Promise<TaxonomyItem> {
  return executeMutation<ApproveTagMutation>(
    ApproveTagDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.approveTag));
}

export function rejectTag(id: string): Promise<TaxonomyItem> {
  return executeMutation<RejectTagMutation>(
    RejectTagDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.rejectTag));
}

export function deleteTag(id: string): Promise<DeleteTagResult> {
  return executeMutation<DeleteTagMutation>(
    DeleteTagDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => data.deleteTag);
}

export function getApprovedPetTypes(): Promise<TaxonomyItem[]> {
  return executeQuery<ApprovedPetTypesQuery>(ApprovedPetTypesDocument).then((data) =>
    data.approvedPetTypes.map(mapTaxonomyItem),
  );
}

export function getApprovedBrands(): Promise<TaxonomyItem[]> {
  return executeQuery<ApprovedBrandsQuery>(ApprovedBrandsDocument).then((data) =>
    data.approvedBrands.map(mapTaxonomyItem),
  );
}

export function getPendingPetTypes(): Promise<TaxonomyItem[]> {
  return executeQuery<PendingPetTypesQuery>(PendingPetTypesDocument).then((data) =>
    data.pendingPetTypes.map(mapTaxonomyItem),
  );
}

export function getPendingBrands(): Promise<TaxonomyItem[]> {
  return executeQuery<PendingBrandsQuery>(PendingBrandsDocument).then((data) =>
    data.pendingBrands.map(mapTaxonomyItem),
  );
}

export function createPetType(input: CreatePetTypeInput): Promise<TaxonomyItem> {
  return executeMutation<CreatePetTypeMutation>(
    CreatePetTypeDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.createPetType));
}

export function createBrand(name: string): Promise<TaxonomyItem> {
  return executeMutation<CreateBrandMutation>(
    CreateBrandDocument,
    { input: { name } },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.createBrand));
}

export function setPetTypeImage(input: SetPetTypeImageInput): Promise<TaxonomyItem> {
  return executeMutation<SetPetTypeImageMutation>(
    SetPetTypeImageDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.setPetTypeImage));
}

export function approvePetType(id: string): Promise<TaxonomyItem> {
  return executeMutation<ApprovePetTypeMutation>(
    ApprovePetTypeDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.approvePetType));
}

export function rejectPetType(id: string): Promise<TaxonomyItem> {
  return executeMutation<RejectPetTypeMutation>(
    RejectPetTypeDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.rejectPetType));
}

export function approveBrand(id: string): Promise<TaxonomyItem> {
  return executeMutation<ApproveBrandMutation>(
    ApproveBrandDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.approveBrand));
}

export function rejectBrand(id: string): Promise<TaxonomyItem> {
  return executeMutation<RejectBrandMutation>(
    RejectBrandDocument,
    { id },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => mapTaxonomyItem(data.rejectBrand));
}

export function deletePetType(input: DeletePetTypeInput): Promise<DeletePetTypeResult> {
  return executeMutation<DeletePetTypeMutation>(
    DeletePetTypeDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => data.deletePetType);
}

export function deleteBrand(input: DeleteBrandInput): Promise<DeleteBrandResult> {
  return executeMutation<DeleteBrandMutation>(
    DeleteBrandDocument,
    { input },
    TAXONOMY_MUTATION_OPTIONS,
  ).then((data) => data.deleteBrand);
}
