import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  APPROVED_CATEGORIES_QUERY,
  APPROVED_TAGS_QUERY,
  APPROVE_CATEGORY,
  APPROVE_TAG,
  CATEGORY_DELETE_IMPACT_QUERY,
  CREATE_CATEGORY,
  CREATE_TAG,
  DELETE_CATEGORY,
  DELETE_TAG,
  MY_CATEGORY_PROPOSALS_QUERY,
  MY_TAG_PROPOSALS_QUERY,
  PENDING_CATEGORIES_QUERY,
  PENDING_TAGS_QUERY,
  REJECTED_CATEGORIES_QUERY,
  REJECTED_TAGS_QUERY,
  REJECT_CATEGORY,
  REJECT_TAG,
  SET_CATEGORY_IMAGE,
  TAG_DELETE_IMPACT_QUERY,
  UPDATE_CATEGORY,
} from '@/lib/graphql/documents';
import type {
  CategoryDeleteImpact,
  CreateCategoryInput,
  DeleteCategoryInput,
  DeleteCategoryResult,
  DeleteTagResult,
  SetCategoryImageInput,
  TagDeleteImpact,
  TaxonomyItem,
  UpdateCategoryInput,
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

export function getTagDeleteImpact(tagId: string): Promise<TagDeleteImpact> {
  return executeQuery<{ tagDeleteImpact: TagDeleteImpact }>(TAG_DELETE_IMPACT_QUERY, {
    tagId,
  }).then((data) => data.tagDeleteImpact);
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
