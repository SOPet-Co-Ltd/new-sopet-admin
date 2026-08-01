'use client';

import { useMemo, type ReactNode } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getErrorMessage, normalizeError } from '@/lib/api/errors';
import { isPermissionErrorCode } from '@/lib/api/error-messages';
import { useToast } from '@/components/ui/toast';

export function shouldToastMutationError(
  error: unknown,
  meta: { toastError?: boolean } | undefined,
): boolean {
  // Explicit opt-out (e.g. review forms that render inline errors).
  if (meta?.toastError === false) {
    return false;
  }
  // Explicit opt-in (e.g. vendor order workflow).
  if (meta?.toastError === true) {
    return true;
  }
  // Role/permission failures must always notify (row 26) even when a hook
  // forgot to set toastError — otherwise STAFF hitting gated actions fails silently.
  return isPermissionErrorCode(normalizeError(error).code);
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const { showError } = useToast();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            const meta = mutation.meta as { toastError?: boolean } | undefined;
            if (!shouldToastMutationError(error, meta)) {
              return;
            }
            showError(getErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
            // Fallback for hooks without an explicit AD-3 staleTime override.
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [showError],
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
