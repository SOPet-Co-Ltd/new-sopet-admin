'use client';

import { useMemo, type ReactNode } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/toast';

export function QueryProvider({ children }: { children: ReactNode }) {
  const { showError } = useToast();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (!(mutation.meta as { toastError?: boolean } | undefined)?.toastError) {
              return;
            }
            showError(getErrorMessage(error));
          },
        }),
        defaultOptions: {
          queries: {
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
