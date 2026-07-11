import type { Route } from '@playwright/test';

type GraphQLBody = {
  operationName?: string;
  query?: string;
};

export function getGraphQLOperation(body: GraphQLBody): string | undefined {
  if (body.operationName) {
    return body.operationName;
  }

  const match = /(?:query|mutation)\s+(\w+)/.exec(body.query ?? '');
  return match?.[1];
}

export async function fulfillGraphQL(route: Route, data: Record<string, unknown>) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data }),
  });
}
