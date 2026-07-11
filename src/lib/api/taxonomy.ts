import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  APPROVED_CATEGORIES_QUERY,
  APPROVED_TAGS_QUERY,
  APPROVED_PET_TYPES_QUERY,
  APPROVED_BRANDS_QUERY,
  APPROVE_CATEGORY,
  APPROVE_TAG,
  APPROVE_PET_TYPE,
  APPROVE_BRAND,
  CATEGORY_DELETE_IMPACT_QUERY,
  CREATE_CATEGORY,
  CREATE_TAG,
  CREATE_PET_TYPE,
  CREATE_BRAND,
  DELETE_CATEGORY,
  DELETE_TAG,
  DELETE_PET_TYPE,
  DELETE_BRAND,
  MY_CATEGORY_PROPOSALS_QUERY,
  MY_TAG_PROPOSALS_QUERY,
  PENDING_CATEGORIES_QUERY,
  PENDING_TAGS_QUERY,
  PENDING_PET_TYPES_QUERY,
  PENDING_BRANDS_QUERY,
  PET_TYPE_DELETE_IMPACT_QUERY,
  BRAND_DELETE_IMPACT_QUERY,
  REJECTED_CATEGORIES_QUERY,
  REJECTED_TAGS_QUERY,
  REJECT_CATEGORY,
  REJECT_TAG,
  REJECT_PET_TYPE,
  REJECT_BRAND,
  SET_CATEGORY_IMAGE,
  SET_PET_TYPE_IMAGE,
  TAG_DELETE_IMPACT_QUERY,
  UPDATE_CATEGORY,
  UPDATE_PET_TYPE,
} from '@/lib/graphql/documents';
import type {
  CategoryDeleteImpact,
  CreateCategoryInput,
  CreatePetTypeInput,
  DeleteCategoryInput,
  DeletePetTypeInput,
  DeleteBrandInput,
  DeleteCategoryResult,
  DeleteTagResult,
  DeletePetTypeResult,
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
  return executeQuery<{ approvedCategories: GqlTaxonomyItem[] }>(APPROVED_CATEGORIES_QUERY).then(
    (data) => data.approvedCategories.map(mapTaxonomyItem),
  );
}

export function getApprovedTags(): Promise<TaxonomyItem[]> {
  return executeQuery<{ approvedTags: GqlTaxonomyItem[] }>(APPROVED_TAGS_QUERY).then((data) =>
    data.approvedTags.map(mapTaxonomyItem),
  );
}

export function getPendingCategories(): Promise<TaxonomyItem[]> {
  return executeQuery<{ pendingCategories: GqlTaxonomyItem[] }>(PENDING_CATEGORIES_QUERY).then(
    (data) => data.pendingCategories.map(mapTaxonomyItem),
  );
}

export function getPendingTags(): Promise<TaxonomyItem[]> {
  return executeQuery<{ pendingTags: GqlTaxonomyItem[] }>(PENDING_TAGS_QUERY).then((data) =>
    data.pendingTags.map(mapTaxonomyItem),
  );
}

export function getRejectedCategories(): Promise<TaxonomyItem[]> {
  return executeQuery<{ rejectedCategories: GqlTaxonomyItem[] }>(REJECTED_CATEGORIES_QUERY).then(
    (data) => data.rejectedCategories.map(mapTaxonomyItem),
  );
}

export function getRejectedTags(): Promise<TaxonomyItem[]> {
  return executeQuery<{ rejectedTags: GqlTaxonomyItem[] }>(REJECTED_TAGS_QUERY).then((data) =>
    data.rejectedTags.map(mapTaxonomyItem),
  );
}

export function getMyCategoryProposals(): Promise<TaxonomyItem[]> {
  return executeQuery<{ myCategoryProposals: GqlTaxonomyItem[] }>(MY_CATEGORY_PROPOSALS_QUERY).then(
    (data) => data.myCategoryProposals.map(mapTaxonomyItem),
  );
}

export function getMyTagProposals(): Promise<TaxonomyItem[]> {
  return executeQuery<{ myTagProposals: GqlTaxonomyItem[] }>(MY_TAG_PROPOSALS_QUERY).then((data) =>
    data.myTagProposals.map(mapTaxonomyItem),
  );
}

export function getCategoryDeleteImpact(categoryId: string): Promise<CategoryDeleteImpact> {
  return executeQuery<{ categoryDeleteImpact: CategoryDeleteImpact }>(
    CATEGORY_DELETE_IMPACT_QUERY,
    {
      categoryId,
    },
  ).then((data) => data.categoryDeleteImpact);
}

export function getTagDeleteImpact(tagId: string): Promise<TaxonomyDeleteImpact> {
  return executeQuery<{ tagDeleteImpact: TaxonomyDeleteImpact }>(TAG_DELETE_IMPACT_QUERY, {
    tagId,
  }).then((data) => data.tagDeleteImpact);
}

export function getPetTypeDeleteImpact(petTypeId: string): Promise<TaxonomyDeleteImpact> {
  return executeQuery<{ petTypeDeleteImpact: TaxonomyDeleteImpact }>(PET_TYPE_DELETE_IMPACT_QUERY, {
    petTypeId,
  }).then((data) => data.petTypeDeleteImpact);
}

export function getBrandDeleteImpact(brandId: string): Promise<TaxonomyDeleteImpact> {
  return executeQuery<{ brandDeleteImpact: TaxonomyDeleteImpact }>(BRAND_DELETE_IMPACT_QUERY, {
    brandId,
  }).then((data) => data.brandDeleteImpact);
}

export function createCategory(input: CreateCategoryInput): Promise<TaxonomyItem> {
  return executeMutation<{ createCategory: GqlTaxonomyItem }>(CREATE_CATEGORY, {
    input,
  }).then((data) => mapTaxonomyItem(data.createCategory));
}

export function createTag(name: string): Promise<TaxonomyItem> {
  return executeMutation<{ createTag: GqlTaxonomyItem }>(CREATE_TAG, {
    input: { name },
  }).then((data) => mapTaxonomyItem(data.createTag));
}

export function setCategoryImage(input: SetCategoryImageInput): Promise<TaxonomyItem> {
  return executeMutation<{ setCategoryImage: GqlTaxonomyItem }>(SET_CATEGORY_IMAGE, {
    input,
  }).then((data) => mapTaxonomyItem(data.setCategoryImage));
}

export function updateCategory(input: UpdateCategoryInput): Promise<TaxonomyItem> {
  return executeMutation<{ updateCategory: GqlTaxonomyItem }>(UPDATE_CATEGORY, {
    input,
  }).then((data) => mapTaxonomyItem(data.updateCategory));
}

export function updatePetType(input: UpdatePetTypeInput): Promise<TaxonomyItem> {
  return executeMutation<{ updatePetType: GqlTaxonomyItem }>(UPDATE_PET_TYPE, {
    input,
  }).then((data) => mapTaxonomyItem(data.updatePetType));
}

export function approveCategory(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ approveCategory: GqlTaxonomyItem }>(APPROVE_CATEGORY, {
    id,
  }).then((data) => mapTaxonomyItem(data.approveCategory));
}

export function rejectCategory(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ rejectCategory: GqlTaxonomyItem }>(REJECT_CATEGORY, {
    id,
  }).then((data) => mapTaxonomyItem(data.rejectCategory));
}

export function deleteCategory(input: DeleteCategoryInput): Promise<DeleteCategoryResult> {
  return executeMutation<{ deleteCategory: DeleteCategoryResult }>(DELETE_CATEGORY, {
    input,
  }).then((data) => data.deleteCategory);
}

export function approveTag(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ approveTag: GqlTaxonomyItem }>(APPROVE_TAG, {
    id,
  }).then((data) => mapTaxonomyItem(data.approveTag));
}

export function rejectTag(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ rejectTag: GqlTaxonomyItem }>(REJECT_TAG, {
    id,
  }).then((data) => mapTaxonomyItem(data.rejectTag));
}

export function deleteTag(id: string): Promise<DeleteTagResult> {
  return executeMutation<{ deleteTag: DeleteTagResult }>(DELETE_TAG, {
    id,
  }).then((data) => data.deleteTag);
}

export function getApprovedPetTypes(): Promise<TaxonomyItem[]> {
  return executeQuery<{ approvedPetTypes: GqlTaxonomyItem[] }>(APPROVED_PET_TYPES_QUERY).then(
    (data) => data.approvedPetTypes.map(mapTaxonomyItem),
  );
}

export function getApprovedBrands(): Promise<TaxonomyItem[]> {
  return executeQuery<{ approvedBrands: GqlTaxonomyItem[] }>(APPROVED_BRANDS_QUERY).then((data) =>
    data.approvedBrands.map(mapTaxonomyItem),
  );
}

export function getPendingPetTypes(): Promise<TaxonomyItem[]> {
  return executeQuery<{ pendingPetTypes: GqlTaxonomyItem[] }>(PENDING_PET_TYPES_QUERY).then(
    (data) => data.pendingPetTypes.map(mapTaxonomyItem),
  );
}

export function getPendingBrands(): Promise<TaxonomyItem[]> {
  return executeQuery<{ pendingBrands: GqlTaxonomyItem[] }>(PENDING_BRANDS_QUERY).then((data) =>
    data.pendingBrands.map(mapTaxonomyItem),
  );
}

export function createPetType(input: CreatePetTypeInput): Promise<TaxonomyItem> {
  return executeMutation<{ createPetType: GqlTaxonomyItem }>(CREATE_PET_TYPE, {
    input,
  }).then((data) => mapTaxonomyItem(data.createPetType));
}

export function createBrand(name: string): Promise<TaxonomyItem> {
  return executeMutation<{ createBrand: GqlTaxonomyItem }>(CREATE_BRAND, {
    input: { name },
  }).then((data) => mapTaxonomyItem(data.createBrand));
}

export function setPetTypeImage(input: SetPetTypeImageInput): Promise<TaxonomyItem> {
  return executeMutation<{ setPetTypeImage: GqlTaxonomyItem }>(SET_PET_TYPE_IMAGE, {
    input,
  }).then((data) => mapTaxonomyItem(data.setPetTypeImage));
}

export function approvePetType(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ approvePetType: GqlTaxonomyItem }>(APPROVE_PET_TYPE, {
    id,
  }).then((data) => mapTaxonomyItem(data.approvePetType));
}

export function rejectPetType(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ rejectPetType: GqlTaxonomyItem }>(REJECT_PET_TYPE, {
    id,
  }).then((data) => mapTaxonomyItem(data.rejectPetType));
}

export function approveBrand(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ approveBrand: GqlTaxonomyItem }>(APPROVE_BRAND, {
    id,
  }).then((data) => mapTaxonomyItem(data.approveBrand));
}

export function rejectBrand(id: string): Promise<TaxonomyItem> {
  return executeMutation<{ rejectBrand: GqlTaxonomyItem }>(REJECT_BRAND, {
    id,
  }).then((data) => mapTaxonomyItem(data.rejectBrand));
}

export function deletePetType(input: DeletePetTypeInput): Promise<DeletePetTypeResult> {
  return executeMutation<{ deletePetType: DeletePetTypeResult }>(DELETE_PET_TYPE, {
    input,
  }).then((data) => data.deletePetType);
}

export function deleteBrand(input: DeleteBrandInput): Promise<DeleteBrandResult> {
  return executeMutation<{ deleteBrand: DeleteBrandResult }>(DELETE_BRAND, {
    input,
  }).then((data) => data.deleteBrand);
}
