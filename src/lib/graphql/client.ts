import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  type DocumentNode,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { CombinedGraphQLErrors, ServerError, ServerParseError } from '@apollo/client/errors';
import { createClient } from 'graphql-ws';
import { getGraphqlWsUrl, GRAPHQL_URL } from '@/lib/config';
import { ApiError } from '@/lib/api/errors-core';
import { normalizeError } from '@/lib/api/errors';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';
import { clearTokens, hasClientSession, notifyAuthFailure, refreshViaBff } from './tokens';

let refreshPromise: Promise<boolean> | null = null;
let apolloClient: ApolloClient | null = null;

type WsReconnectListener = () => void;
const wsReconnectListeners = new Set<WsReconnectListener>();

export function subscribeWsReconnect(listener: WsReconnectListener): () => void {
  wsReconnectListeners.add(listener);
  return () => {
    wsReconnectListeners.delete(listener);
  };
}

function notifyWsReconnect(): void {
  wsReconnectListeners.forEach((listener) => {
    listener();
  });
}

function createWsLink(): GraphQLWsLink | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return new GraphQLWsLink(
    createClient({
      url: getGraphqlWsUrl(),
      // Auth-gated subscriptions are out of scope; paymentStatusUpdated is @Public.
      connectionParams: () => ({}),
      on: {
        connected: (_socket, _payload, wasReconnect) => {
          if (wasReconnect) {
            notifyWsReconnect();
          }
        },
      },
    }),
  );
}

function createApolloClient(): ApolloClient {
  const httpLink = new HttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include',
  });

  const wsLink = createWsLink();

  const link = wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink,
      )
    : httpLink;

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
}

export function getApolloClient(): ApolloClient {
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }
  return apolloClient;
}

export function resetApolloClientForTests(): void {
  apolloClient = null;
}

function getErrorStatus(error: unknown): number | undefined {
  if (ServerError.is(error) || ServerParseError.is(error)) {
    return error.statusCode;
  }
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code;
    if (code === 'UNAUTHENTICATED' || code === 'UNAUTHORIZED') {
      return 401;
    }
  }
  return undefined;
}

export type ExecuteQueryOptions = {
  fetchPolicy?: 'cache-first' | 'network-only';
};

async function withAuthRetry<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const normalized = normalizeError(error);
    if (normalized.code === 'ACCOUNT_SUSPENDED') {
      notifyAuthFailure(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
      throw normalized;
    }

    const status = getErrorStatus(error);
    if (status !== 401 || !hasClientSession()) {
      throw normalized;
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshViaBff().finally(() => {
          refreshPromise = null;
        });
      }
      const ok = await refreshPromise;
      if (!ok) {
        throw new Error('Token refresh failed.');
      }
      return await run();
    } catch (refreshError) {
      const refreshNormalized = normalizeError(refreshError);
      if (refreshNormalized.code === 'ACCOUNT_SUSPENDED') {
        notifyAuthFailure(ERROR_MESSAGES.ACCOUNT_SUSPENDED);
        throw new ApiError({
          code: 'ACCOUNT_SUSPENDED',
          message: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
          status: 403,
        });
      }
      await clearTokens();
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
  options?: ExecuteQueryOptions,
): Promise<TData>;
export async function executeQuery<TData>(
  document: DocumentNode,
  variables?: OperationVariables,
  options?: ExecuteQueryOptions,
): Promise<TData>;
export async function executeQuery<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(document: DocumentNode, variables?: TVariables, options?: ExecuteQueryOptions): Promise<TData> {
  return withAuthRetry(async () => {
    const result = await getApolloClient().query({
      query: document,
      ...(variables ? { variables } : {}),
      fetchPolicy: options?.fetchPolicy ?? 'network-only',
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

export type ExecuteMutationOptions = {
  skipCacheReset?: boolean;
};

export async function executeMutation<
  TData,
  TVariables extends OperationVariables = OperationVariables,
>(
  document: DocumentNode,
  variables?: TVariables,
  options?: ExecuteMutationOptions,
): Promise<TData> {
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

    if (!options?.skipCacheReset) {
      await getApolloClient().cache.reset();
    }
    return result.data as TData;
  });
}
