'use client';

import type { ReactNode } from 'react';
import { getErrorMessage } from '@/lib/api/errors';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';

type QueryErrorStateProps = {
  error: unknown;
  fallback?: string;
  className?: string;
};

export function QueryErrorState({
  error,
  fallback = ERROR_MESSAGES.UNKNOWN_ERROR,
  className = 'text-danger',
}: QueryErrorStateProps) {
  return <p className={className}>{getErrorMessage(error, fallback)}</p>;
}

export function MutationErrorState({
  error,
  fallback = ERROR_MESSAGES.UNKNOWN_ERROR,
  className = 'text-sm text-danger',
}: QueryErrorStateProps) {
  if (!error) return null;
  return <p className={className}>{getErrorMessage(error, fallback)}</p>;
}

export function FormRootError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-danger">{message}</p>;
}

export function InlineError({
  children,
  className = 'text-sm text-danger',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={className}>{children}</p>;
}
