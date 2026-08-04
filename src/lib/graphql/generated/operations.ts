/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type NotificationsQueryVariables = Exact<{
  unreadOnly?: boolean | null | undefined;
}>;

export type NotificationsQuery = {
  notifications: Array<{
    id: string;
    type: string;
    title: string | null;
    message: string;
    metadata: string | null;
    isRead: boolean;
    createdAt: string;
  }>;
};

export type MarkNotificationReadMutationVariables = Exact<{
  id: string;
}>;

export type MarkNotificationReadMutation = { markNotificationRead: boolean };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never }>;

export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: boolean };

export type UnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never }>;

export type UnreadNotificationsCountQuery = { unreadNotificationsCount: number };

export type PromotionFieldsFragment = {
  id: string;
  storeId: string | null;
  code: string;
  name: string;
  description: string | null;
  type: string;
  scope: string;
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usagePerCustomer: number;
  usageCount: number;
  isActive: boolean;
  autoApply: boolean;
  priority: number;
  conditions: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type StorePromotionsQueryVariables = Exact<{
  storeId: string;
}>;

export type StorePromotionsQuery = {
  storePromotions: Array<{
    id: string;
    storeId: string | null;
    code: string;
    name: string;
    description: string | null;
    type: string;
    scope: string;
    discountValue: number;
    minPurchaseAmount: number | null;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    usagePerCustomer: number;
    usageCount: number;
    isActive: boolean;
    autoApply: boolean;
    priority: number;
    conditions: string | null;
    startsAt: string | null;
    expiresAt: string | null;
    createdAt: string;
  }>;
};

export type SearchRankingWeightsQueryVariables = Exact<{ [key: string]: never }>;

export type SearchRankingWeightsQuery = {
  searchRankingWeights: {
    text: number;
    prefixBoost: number;
    soldCount: number;
    averageRating: number;
    reviewCount: number;
    personalizationCap: number;
    trigramFallbackThreshold: number;
    trigramMinSimilarity: number;
    rrfK: number;
  };
};

export type UpdateSearchRankingWeightsMutationVariables = Exact<{
  input: Types.UpdateSearchRankingWeightsInput;
}>;

export type UpdateSearchRankingWeightsMutation = {
  updateSearchRankingWeights: {
    text: number;
    prefixBoost: number;
    soldCount: number;
    averageRating: number;
    reviewCount: number;
    personalizationCap: number;
    trigramFallbackThreshold: number;
    trigramMinSimilarity: number;
    rrfK: number;
  };
};

export type SearchSynonymsQueryVariables = Exact<{ [key: string]: never }>;

export type SearchSynonymsQuery = {
  searchSynonyms: Array<{
    id: string;
    terms: Array<string>;
    expansion: string;
    isActive: boolean;
    updatedAt: string;
  }>;
};

export type CreateSearchSynonymMutationVariables = Exact<{
  input: Types.CreateSearchSynonymInput;
}>;

export type CreateSearchSynonymMutation = {
  createSearchSynonym: {
    id: string;
    terms: Array<string>;
    expansion: string;
    isActive: boolean;
    updatedAt: string;
  };
};

export type UpdateSearchSynonymMutationVariables = Exact<{
  id: string;
  input: Types.UpdateSearchSynonymInput;
}>;

export type UpdateSearchSynonymMutation = {
  updateSearchSynonym: {
    id: string;
    terms: Array<string>;
    expansion: string;
    isActive: boolean;
    updatedAt: string;
  };
};

export type DeleteSearchSynonymMutationVariables = Exact<{
  id: string;
}>;

export type DeleteSearchSynonymMutation = { deleteSearchSynonym: boolean };

export type SearchAnalyticsSummaryQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;

export type SearchAnalyticsSummaryQuery = {
  searchAnalyticsSummary: {
    totalSearches: number;
    uniqueQueries: number;
    zeroResultRate: number;
    avgResultsPerQuery: number;
    avgLatencyMs: number;
  };
};

export type SearchAnalyticsTopQueriesQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
  limit?: number | null | undefined;
}>;

export type SearchAnalyticsTopQueriesQuery = {
  searchAnalyticsTopQueries: Array<{ query: string; searchCount: number; avgResultCount: number }>;
};

export type SearchAnalyticsZeroResultQueriesQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
  limit?: number | null | undefined;
}>;

export type SearchAnalyticsZeroResultQueriesQuery = {
  searchAnalyticsZeroResultQueries: Array<{
    query: string;
    searchCount: number;
    avgResultCount: number;
  }>;
};

export type SearchAnalyticsSuggestionCtrQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;

export type SearchAnalyticsSuggestionCtrQuery = {
  searchAnalyticsSuggestionCtr: Array<{
    prefixBucket: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
};

export type ExportSearchAnalyticsCsvQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;

export type ExportSearchAnalyticsCsvQuery = { exportSearchAnalyticsCsv: string };

export type ApprovedCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedCategoriesQuery = {
  approvedCategories: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type ApprovedTagsQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedTagsQuery = {
  approvedTags: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type PendingCategoriesQuery = {
  pendingCategories: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingTagsQueryVariables = Exact<{ [key: string]: never }>;

export type PendingTagsQuery = {
  pendingTags: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type MyCategoryProposalsQueryVariables = Exact<{ [key: string]: never }>;

export type MyCategoryProposalsQuery = {
  myCategoryProposals: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type MyTagProposalsQueryVariables = Exact<{ [key: string]: never }>;

export type MyTagProposalsQuery = {
  myTagProposals: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type CreateCategoryMutationVariables = Exact<{
  input: Types.CreateCategoryInput;
}>;

export type CreateCategoryMutation = {
  createCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type CreateTagMutationVariables = Exact<{
  input: Types.CreateTagInput;
}>;

export type CreateTagMutation = {
  createTag: { id: string; name: string; slug: string; approvalStatus: string };
};

export type ApproveCategoryMutationVariables = Exact<{
  id: string;
}>;

export type ApproveCategoryMutation = {
  approveCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type RejectCategoryMutationVariables = Exact<{
  id: string;
}>;

export type RejectCategoryMutation = {
  rejectCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type ApproveTagMutationVariables = Exact<{
  id: string;
}>;

export type ApproveTagMutation = {
  approveTag: { id: string; name: string; slug: string; approvalStatus: string };
};

export type RejectTagMutationVariables = Exact<{
  id: string;
}>;

export type RejectTagMutation = {
  rejectTag: { id: string; name: string; slug: string; approvalStatus: string };
};

export type ApprovedPetTypesQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedPetTypesQuery = {
  approvedPetTypes: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type ApprovedBrandsQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedBrandsQuery = {
  approvedBrands: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingPetTypesQueryVariables = Exact<{ [key: string]: never }>;

export type PendingPetTypesQuery = {
  pendingPetTypes: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type PendingBrandsQueryVariables = Exact<{ [key: string]: never }>;

export type PendingBrandsQuery = {
  pendingBrands: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type CreatePetTypeMutationVariables = Exact<{
  input: Types.CreatePetTypeInput;
}>;

export type CreatePetTypeMutation = {
  createPetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type CreateBrandMutationVariables = Exact<{
  input: Types.CreateBrandInput;
}>;

export type CreateBrandMutation = {
  createBrand: { id: string; name: string; slug: string; approvalStatus: string };
};

export type SetPetTypeImageMutationVariables = Exact<{
  input: Types.SetPetTypeImageInput;
}>;

export type SetPetTypeImageMutation = {
  setPetTypeImage: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type ApprovePetTypeMutationVariables = Exact<{
  id: string;
}>;

export type ApprovePetTypeMutation = {
  approvePetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type RejectPetTypeMutationVariables = Exact<{
  id: string;
}>;

export type RejectPetTypeMutation = {
  rejectPetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type ApproveBrandMutationVariables = Exact<{
  id: string;
}>;

export type ApproveBrandMutation = {
  approveBrand: { id: string; name: string; slug: string; approvalStatus: string };
};

export type RejectBrandMutationVariables = Exact<{
  id: string;
}>;

export type RejectBrandMutation = {
  rejectBrand: { id: string; name: string; slug: string; approvalStatus: string };
};

export type CategoryDeleteImpactQueryVariables = Exact<{
  categoryId: string;
}>;

export type CategoryDeleteImpactQuery = {
  categoryDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type TagDeleteImpactQueryVariables = Exact<{
  tagId: string;
}>;

export type TagDeleteImpactQuery = {
  tagDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type PetTypeDeleteImpactQueryVariables = Exact<{
  petTypeId: string;
}>;

export type PetTypeDeleteImpactQuery = {
  petTypeDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type BrandDeleteImpactQueryVariables = Exact<{
  brandId: string;
}>;

export type BrandDeleteImpactQuery = {
  brandDeleteImpact: {
    productCount: number;
    products: Array<{ id: string; name: string; slug: string }>;
  };
};

export type RejectedCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type RejectedCategoriesQuery = {
  rejectedCategories: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type RejectedTagsQueryVariables = Exact<{ [key: string]: never }>;

export type RejectedTagsQuery = {
  rejectedTags: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type RejectedPetTypesQueryVariables = Exact<{ [key: string]: never }>;

export type RejectedPetTypesQuery = {
  rejectedPetTypes: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
    createdBy: string;
    createdAt: string;
  }>;
};

export type RejectedBrandsQueryVariables = Exact<{ [key: string]: never }>;

export type RejectedBrandsQuery = {
  rejectedBrands: Array<{
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    createdBy: string;
    createdAt: string;
  }>;
};

export type SetCategoryImageMutationVariables = Exact<{
  input: Types.SetCategoryImageInput;
}>;

export type SetCategoryImageMutation = {
  setCategoryImage: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type UpdateCategoryMutationVariables = Exact<{
  input: Types.UpdateCategoryInput;
}>;

export type UpdateCategoryMutation = {
  updateCategory: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type UpdatePetTypeMutationVariables = Exact<{
  input: Types.UpdatePetTypeInput;
}>;

export type UpdatePetTypeMutation = {
  updatePetType: {
    id: string;
    name: string;
    slug: string;
    approvalStatus: string;
    imageUrl: string | null;
  };
};

export type UpdateTagMutationVariables = Exact<{
  input: Types.UpdateTagInput;
}>;

export type UpdateTagMutation = {
  updateTag: { id: string; name: string; slug: string; approvalStatus: string };
};

export type UpdateBrandMutationVariables = Exact<{
  input: Types.UpdateBrandInput;
}>;

export type UpdateBrandMutation = {
  updateBrand: { id: string; name: string; slug: string; approvalStatus: string };
};

export type DeleteCategoryMutationVariables = Exact<{
  input: Types.DeleteTaxonomyInput;
}>;

export type DeleteCategoryMutation = {
  deleteCategory: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
    reassignedProductCount: number | null;
    replacementCategoryId: string | null;
  };
};

export type DeleteTagMutationVariables = Exact<{
  id: string;
}>;

export type DeleteTagMutation = {
  deleteTag: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
  };
};

export type DeletePetTypeMutationVariables = Exact<{
  input: Types.DeleteTaxonomyInput;
}>;

export type DeletePetTypeMutation = {
  deletePetType: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
  };
};

export type DeleteBrandMutationVariables = Exact<{
  input: Types.DeleteTaxonomyInput;
}>;

export type DeleteBrandMutation = {
  deleteBrand: {
    success: boolean;
    deletedId: string;
    detachedProductCount: number;
    notifiedStoreCount: number;
  };
};

export const PromotionFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PromotionFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PromotionType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'code' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scope' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountValue' } },
          { kind: 'Field', name: { kind: 'Name', value: 'minPurchaseAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDiscountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageLimit' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usagePerCustomer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
          { kind: 'Field', name: { kind: 'Name', value: 'autoApply' } },
          { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'startsAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PromotionFieldsFragment, unknown>;
export const NotificationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Notifications' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'unreadOnly' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'notifications' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'unreadOnly' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'unreadOnly' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const MarkNotificationReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkNotificationRead' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markNotificationRead' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkAllNotificationsRead' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'markAllNotificationsRead' } }],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkAllNotificationsReadMutation,
  MarkAllNotificationsReadMutationVariables
>;
export const UnreadNotificationsCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'UnreadNotificationsCount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'unreadNotificationsCount' } }],
      },
    },
  ],
} as unknown as DocumentNode<UnreadNotificationsCountQuery, UnreadNotificationsCountQueryVariables>;
export const StorePromotionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'StorePromotions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storePromotions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PromotionFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PromotionFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PromotionType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'code' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scope' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountValue' } },
          { kind: 'Field', name: { kind: 'Name', value: 'minPurchaseAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDiscountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageLimit' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usagePerCustomer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'usageCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
          { kind: 'Field', name: { kind: 'Name', value: 'autoApply' } },
          { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
          { kind: 'Field', name: { kind: 'Name', value: 'startsAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StorePromotionsQuery, StorePromotionsQueryVariables>;
export const SearchRankingWeightsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchRankingWeights' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchRankingWeights' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                { kind: 'Field', name: { kind: 'Name', value: 'prefixBoost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'soldCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reviewCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'personalizationCap' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramFallbackThreshold' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramMinSimilarity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rrfK' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchRankingWeightsQuery, SearchRankingWeightsQueryVariables>;
export const UpdateSearchRankingWeightsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSearchRankingWeights' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateSearchRankingWeightsInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSearchRankingWeights' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                { kind: 'Field', name: { kind: 'Name', value: 'prefixBoost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'soldCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reviewCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'personalizationCap' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramFallbackThreshold' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trigramMinSimilarity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rrfK' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSearchRankingWeightsMutation,
  UpdateSearchRankingWeightsMutationVariables
>;
export const SearchSynonymsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchSynonyms' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchSynonyms' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'terms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expansion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchSynonymsQuery, SearchSynonymsQueryVariables>;
export const CreateSearchSynonymDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSearchSynonym' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateSearchSynonymInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createSearchSynonym' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'terms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expansion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateSearchSynonymMutation, CreateSearchSynonymMutationVariables>;
export const UpdateSearchSynonymDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSearchSynonym' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateSearchSynonymInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSearchSynonym' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'terms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expansion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateSearchSynonymMutation, UpdateSearchSynonymMutationVariables>;
export const DeleteSearchSynonymDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteSearchSynonym' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteSearchSynonym' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteSearchSynonymMutation, DeleteSearchSynonymMutationVariables>;
export const SearchAnalyticsSummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsSummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalSearches' } },
                { kind: 'Field', name: { kind: 'Name', value: 'uniqueQueries' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zeroResultRate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgResultsPerQuery' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgLatencyMs' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchAnalyticsSummaryQuery, SearchAnalyticsSummaryQueryVariables>;
export const SearchAnalyticsTopQueriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsTopQueries' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsTopQueries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
                { kind: 'Field', name: { kind: 'Name', value: 'searchCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgResultCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchAnalyticsTopQueriesQuery,
  SearchAnalyticsTopQueriesQueryVariables
>;
export const SearchAnalyticsZeroResultQueriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsZeroResultQueries' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsZeroResultQueries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'query' } },
                { kind: 'Field', name: { kind: 'Name', value: 'searchCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'avgResultCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchAnalyticsZeroResultQueriesQuery,
  SearchAnalyticsZeroResultQueriesQueryVariables
>;
export const SearchAnalyticsSuggestionCtrDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchAnalyticsSuggestionCtr' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchAnalyticsSuggestionCtr' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'prefixBucket' } },
                { kind: 'Field', name: { kind: 'Name', value: 'impressions' } },
                { kind: 'Field', name: { kind: 'Name', value: 'clicks' } },
                { kind: 'Field', name: { kind: 'Name', value: 'ctr' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchAnalyticsSuggestionCtrQuery,
  SearchAnalyticsSuggestionCtrQueryVariables
>;
export const ExportSearchAnalyticsCsvDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ExportSearchAnalyticsCsv' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'DateTime' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'exportSearchAnalyticsCsv' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'fromDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'fromDate' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'toDate' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'toDate' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExportSearchAnalyticsCsvQuery, ExportSearchAnalyticsCsvQueryVariables>;
export const ApprovedCategoriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedCategories' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedCategories' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedCategoriesQuery, ApprovedCategoriesQueryVariables>;
export const ApprovedTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedTagsQuery, ApprovedTagsQueryVariables>;
export const PendingCategoriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingCategories' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingCategories' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingCategoriesQuery, PendingCategoriesQueryVariables>;
export const PendingTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingTagsQuery, PendingTagsQueryVariables>;
export const MyCategoryProposalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyCategoryProposals' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myCategoryProposals' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyCategoryProposalsQuery, MyCategoryProposalsQueryVariables>;
export const MyTagProposalsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyTagProposals' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myTagProposals' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyTagProposalsQuery, MyTagProposalsQueryVariables>;
export const CreateCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateCategoryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const CreateTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateTagInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateTagMutation, CreateTagMutationVariables>;
export const ApproveCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApproveCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approveCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveCategoryMutation, ApproveCategoryMutationVariables>;
export const RejectCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectCategoryMutation, RejectCategoryMutationVariables>;
export const ApproveTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApproveTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approveTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveTagMutation, ApproveTagMutationVariables>;
export const RejectTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectTagMutation, RejectTagMutationVariables>;
export const ApprovedPetTypesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedPetTypes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedPetTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedPetTypesQuery, ApprovedPetTypesQueryVariables>;
export const ApprovedBrandsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedBrands' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedBrands' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedBrandsQuery, ApprovedBrandsQueryVariables>;
export const PendingPetTypesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingPetTypes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingPetTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingPetTypesQuery, PendingPetTypesQueryVariables>;
export const PendingBrandsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PendingBrands' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pendingBrands' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PendingBrandsQuery, PendingBrandsQueryVariables>;
export const CreatePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreatePetTypeInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePetTypeMutation, CreatePetTypeMutationVariables>;
export const CreateBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateBrandInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateBrandMutation, CreateBrandMutationVariables>;
export const SetPetTypeImageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetPetTypeImage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SetPetTypeImageInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setPetTypeImage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetPetTypeImageMutation, SetPetTypeImageMutationVariables>;
export const ApprovePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApprovePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvePetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovePetTypeMutation, ApprovePetTypeMutationVariables>;
export const RejectPetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectPetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectPetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectPetTypeMutation, RejectPetTypeMutationVariables>;
export const ApproveBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApproveBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approveBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApproveBrandMutation, ApproveBrandMutationVariables>;
export const RejectBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RejectBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectBrandMutation, RejectBrandMutationVariables>;
export const CategoryDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CategoryDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'categoryId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'categoryDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'categoryId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'categoryId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CategoryDeleteImpactQuery, CategoryDeleteImpactQueryVariables>;
export const TagDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'TagDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'tagId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tagDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tagId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'tagId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TagDeleteImpactQuery, TagDeleteImpactQueryVariables>;
export const PetTypeDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PetTypeDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'petTypeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'petTypeDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'petTypeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'petTypeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PetTypeDeleteImpactQuery, PetTypeDeleteImpactQueryVariables>;
export const BrandDeleteImpactDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'BrandDeleteImpact' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'brandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'brandDeleteImpact' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'brandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'brandId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'productCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BrandDeleteImpactQuery, BrandDeleteImpactQueryVariables>;
export const RejectedCategoriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RejectedCategories' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectedCategories' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectedCategoriesQuery, RejectedCategoriesQueryVariables>;
export const RejectedTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RejectedTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectedTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectedTagsQuery, RejectedTagsQueryVariables>;
export const RejectedPetTypesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RejectedPetTypes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectedPetTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectedPetTypesQuery, RejectedPetTypesQueryVariables>;
export const RejectedBrandsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RejectedBrands' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rejectedBrands' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RejectedBrandsQuery, RejectedBrandsQueryVariables>;
export const SetCategoryImageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetCategoryImage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SetCategoryImageInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setCategoryImage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetCategoryImageMutation, SetCategoryImageMutationVariables>;
export const UpdateCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateCategoryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const UpdatePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdatePetTypeInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdatePetTypeMutation, UpdatePetTypeMutationVariables>;
export const UpdateTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateTagInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateTagMutation, UpdateTagMutationVariables>;
export const UpdateBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateBrandInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'approvalStatus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateBrandMutation, UpdateBrandMutationVariables>;
export const DeleteCategoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCategory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'DeleteTaxonomyInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCategory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reassignedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'replacementCategoryId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const DeleteTagDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteTag' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteTag' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteTagMutation, DeleteTagMutationVariables>;
export const DeletePetTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePetType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'DeleteTaxonomyInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePetType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeletePetTypeMutation, DeletePetTypeMutationVariables>;
export const DeleteBrandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteBrand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'DeleteTaxonomyInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteBrand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deletedId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'detachedProductCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notifiedStoreCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteBrandMutation, DeleteBrandMutationVariables>;
