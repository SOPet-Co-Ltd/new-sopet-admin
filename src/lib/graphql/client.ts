import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  type DocumentNode,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { CombinedGraphQLErrors, ServerError, ServerParseError } from '@apollo/client/errors';
import { GRAPHQL_URL } from '@/lib/config';
import { ApiError } from '@/lib/api/errors-core';
import { normalizeError } from '@/lib/api/errors';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  notifyAuthFailure,
  setTokens,
} from './tokens';

let refreshPromise: Promise<string> | null = null;
let apolloClient: ApolloClient | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation RefreshToken($input: RefreshTokenInput!) {
          refreshToken(input: $input) {
            accessToken
            refreshToken
          }
        }
      `,
      variables: { input: { refreshToken } },
    }),
  });

  const payload = (await response.json()) as {
    data?: { refreshToken?: { accessToken: string; refreshToken: string } };
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || payload.errors?.length || !payload.data?.refreshToken) {
    throw new Error(payload.errors?.[0]?.message ?? 'Token refresh failed.');
  }

  const { accessToken, refreshToken: newRefreshToken } = payload.data.refreshToken;
  setTokens(accessToken, newRefreshToken);
  return accessToken;
}

function createApolloClient(): ApolloClient {
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include',
  });

  const authLink = setContext((_, { headers }) => {
    const token = getAccessToken();
    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

export function getApolloClient(): ApolloClient {
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }
  return apolloClient;
}

function getErrorStatus(error: unknown): number | undefined {
  if (ServerError.is(error) || ServerParseError.is(error)) {
    return error.statusCode;
  }
  // GraphQL auth failures surface as a 200 response with an UNAUTHENTICATED
  // code in `errors[]`; treat them as 401 so the token refresh retry runs.
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code;
    if (code === 'UNAUTHENTICATED' || code === 'UNAUTHORIZED') {
      return 401;
    }
  }
  return undefined;
}

async function withAuthRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const status = getErrorStatus(error);
    if (status !== 401 || !getRefreshToken()) {
      throw normalizeError(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
      return await run();
    } catch (refreshError) {
      clearTokens();
      notifyAuthFailure();
      throw new ApiError({
        code: 'SESSION_EXPIRED',
        message: ERROR_MESSAGES.SESSION_EXPIRED,
        status: 401,
      });
    }
  }
}

export async function executeQuery<TData, TVariables extends OperationVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<TData>;
export async function executeQuery<TData>(
  document: DocumentNode,
  variables?: OperationVariables,
): Promise<TData>;
export async function executeQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(document: DocumentNode, variables?: TVariables): Promise<TData> {
  return withAuthRetry(async () => {
    const result = await getApolloClient().query({
      query: document,
      ...(variables ? { variables } : {}),
      fetchPolicy: 'network-only',
    });
    if (!result.data) {
      throw new ApiError({
        code: 'UNKNOWN_ERROR',
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
        status: 0,
      });
    }
    return result.data as TData;
  });
}

export async function executeMutation<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(document: DocumentNode, variables?: TVariables): Promise<TData> {
  return withAuthRetry(async () => {
    const result = await getApolloClient().mutate({
      mutation: document,
      ...(variables ? { variables } : {}),
    });

    if (!result.data) {
      throw new ApiError({
        code: 'UNKNOWN_ERROR',
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
        status: 0,
      });
    }

    return result.data as TData;
  });
}
