import type { Page, Route } from '@playwright/test';
import {
  approvedCategories,
  approvedTags,
  categoryDeleteImpact,
  deleteCategoryResult,
  pendingCategories,
  pendingTags,
  rejectedCategories,
  rejectedTags,
} from './data';

type GraphQLBody = {
  operationName?: string;
  query?: string;
};

function operationFromBody(body: GraphQLBody): string | undefined {
  if (body.operationName) {
    return body.operationName;
  }

  const query = body.query ?? '';
  const match = /(?:query|mutation)\s+(\w+)/.exec(query);
  return match?.[1];
}

function graphqlResponse<T>(data: T) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data }),
  };
}

export function resolveTaxonomyOperation(
  operation: string | undefined,
): Record<string, unknown> | null {
  switch (operation) {
    case 'ApprovedCategories':
      return { approvedCategories };
    case 'PendingCategories':
      return { pendingCategories };
    case 'RejectedCategories':
      return { rejectedCategories };
    case 'ApprovedTags':
      return { approvedTags };
    case 'PendingTags':
      return { pendingTags };
    case 'RejectedTags':
      return { rejectedTags };
    case 'CategoryDeleteImpact':
      return { categoryDeleteImpact };
    case 'CreateCategory':
      return {
        createCategory: {
          id: 'cat-created-1',
          name: 'หมวดใหม่',
          slug: 'new-category',
          approvalStatus: 'pending',
          imageUrl: null,
        },
      };
    case 'SetCategoryImage':
      return {
        setCategoryImage: {
          id: 'cat-pending-1',
          name: 'ของเล่นสัตว์',
          slug: 'pet-toys',
          approvalStatus: 'pending',
          imageUrl: 'https://cdn.example.com/categories/pet-toys.webp',
        },
      };
    case 'ApproveCategory':
      return {
        approveCategory: {
          id: 'cat-pending-1',
          name: 'ของเล่นสัตว์',
          slug: 'pet-toys',
          approvalStatus: 'approved',
          imageUrl: 'https://cdn.example.com/categories/pet-toys.webp',
        },
      };
    case 'RejectCategory':
      return {
        rejectCategory: {
          id: 'cat-pending-1',
          name: 'ของเล่นสัตว์',
          slug: 'pet-toys',
          approvalStatus: 'rejected',
          imageUrl: null,
        },
      };
    case 'DeleteCategory':
      return { deleteCategory: deleteCategoryResult };
    case 'DeleteTag':
      return {
        deleteTag: {
          success: true,
          deletedTagId: 'tag-rejected-1',
          detachedProductCount: 0,
        },
      };
    default:
      return null;
  }
}

async function fulfillGraphQL(route: Route) {
  const request = route.request();
  const body = (request.postDataJSON() ?? {}) as GraphQLBody;
  const operation = operationFromBody(body);
  const data = resolveTaxonomyOperation(operation);

  if (data) {
    await route.fulfill(graphqlResponse(data));
    return;
  }

  await route.fulfill(
    graphqlResponse({
      __typename: 'Query',
    }),
  );
}

export async function installTaxonomyGraphQLMocks(page: Page) {
  await page.route('**/graphql', fulfillGraphQL);
}
