import { executeMutation, executeQuery } from '@/lib/graphql/client';
import {
  APPROVED_CATEGORIES_QUERY,
  APPROVED_TAGS_QUERY,
  APPROVE_CATEGORY,
  APPROVE_TAG,
  CREATE_CATEGORY,
  CREATE_TAG,
  MY_CATEGORY_PROPOSALS_QUERY,
  MY_TAG_PROPOSALS_QUERY,
  PENDING_CATEGORIES_QUERY,
  PENDING_TAGS_QUERY,
  REJECT_CATEGORY,
  REJECT_TAG,
} from '@/lib/graphql/documents';
import type { TaxonomyItem } from '@/types';

type GqlTaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  approvalStatus: string;
  createdBy?: string | null;
  createdAt?: string | null;
};

function mapTaxonomyItem(item: GqlTaxonomyItem): TaxonomyItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    status: item.approvalStatus,
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

export function createCategory(name: string): Promise<TaxonomyItem> {
  return executeMutation<{ createCategory: GqlTaxonomyItem }>(CREATE_CATEGORY, {
    input: { name },
  }).then((data) => mapTaxonomyItem(data.createCategory));
}

export function createTag(name: string): Promise<TaxonomyItem> {
  return executeMutation<{ createTag: GqlTaxonomyItem }>(CREATE_TAG, {
    input: { name },
  }).then((data) => mapTaxonomyItem(data.createTag));
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
