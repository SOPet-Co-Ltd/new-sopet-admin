import type { ApiErrorEnvelope } from '@/types/api';
import { CombinedGraphQLErrors, ServerError, ServerParseError } from '@apollo/client/errors';
import { ApiError, isApiError } from './errors-core';
import { envelopeFallbackMessage, ERROR_MESSAGES, messageForErrorCode } from './error-messages';

export { ApiError, isApiError };

type GraphQLErrorShape = {
  message: string;
  extensions?: {
    code?: string;
    originalError?: {
      message?: string;
      error?: { code?: string; message?: string };
    };
  };
};

function isErrorEnvelope(data: unknown): data is ApiErrorEnvelope {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { success?: unknown }).success === false &&
    typeof (data as { error?: unknown }).error === 'object' &&
    (data as { error?: unknown }).error !== null
  );
}

function fromGraphQLError(error: GraphQLErrorShape, status = 0): ApiError {
  const nested = error.extensions?.originalError?.error;
  const code = nested?.code ?? error.extensions?.code ?? 'GRAPHQL_ERROR';
  const apiMessage = nested?.message ?? error.message;
  return new ApiError({
    code,
    message: messageForErrorCode(code, apiMessage),
    status,
    details: error.extensions,
  });
}

function parseErrorEnvelope(bodyText: string): ApiErrorEnvelope | null {
  try {
    const parsed: unknown = JSON.parse(bodyText);
    return isErrorEnvelope(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function finalizeApiError(params: {
  code: string;
  message?: string;
  status: number;
  details?: unknown;
}): ApiError {
  return new ApiError({
    code: params.code,
    message: messageForErrorCode(params.code, params.message),
    status: params.status,
    details: params.details,
  });
}

export function normalizeError(err: unknown): ApiError {
  if (isApiError(err)) {
    return finalizeApiError({
      code: err.code,
      message: err.message,
      status: err.status,
      details: err.details,
    });
  }

  if (CombinedGraphQLErrors.is(err) && err.errors.length > 0) {
    return fromGraphQLError(err.errors[0] as GraphQLErrorShape, 400);
  }

  if (ServerError.is(err) || ServerParseError.is(err)) {
    const envelope = parseErrorEnvelope(err.bodyText);
    if (envelope) {
      return finalizeApiError({
        code: envelope.error.code || 'HTTP_ERROR',
        message: envelope.error.message || envelopeFallbackMessage(),
        status: err.statusCode,
        details: envelope.error.details,
      });
    }
    return finalizeApiError({
      code: 'HTTP_ERROR',
      message: err.message,
      status: err.statusCode,
    });
  }

  if (err && typeof err === 'object' && 'response' in err) {
    const axiosLike = err as {
      response?: { status?: number; data?: unknown };
      message?: string;
      code?: string;
    };
    const status = axiosLike.response?.status ?? 0;
    const data = axiosLike.response?.data;

    if (isErrorEnvelope(data)) {
      return finalizeApiError({
        code: data.error.code || 'UNKNOWN_ERROR',
        message: data.error.message,
        status,
        details: data.error.details,
      });
    }

    if (axiosLike.code === 'ECONNABORTED' || /timeout/i.test(axiosLike.message ?? '')) {
      return finalizeApiError({
        code: 'TIMEOUT',
        status,
      });
    }

    if (!axiosLike.response) {
      return finalizeApiError({
        code: 'NETWORK_ERROR',
        status: 0,
      });
    }

    return finalizeApiError({
      code: 'HTTP_ERROR',
      message: axiosLike.message,
      status,
      details: data,
    });
  }

  if (err instanceof Error) {
    return finalizeApiError({
      code: 'UNKNOWN_ERROR',
      message: err.message,
      status: 0,
    });
  }

  return finalizeApiError({
    code: 'UNKNOWN_ERROR',
    status: 0,
  });
}

/** User-facing Thai message for any thrown value. */
export function getErrorMessage(
  err: unknown,
  fallback: string = ERROR_MESSAGES.UNKNOWN_ERROR,
): string {
  return normalizeError(err).message || fallback;
}
