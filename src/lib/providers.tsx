'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client/react';
import { getApolloClient } from '@/lib/graphql/client';
import { setOnAuthFailure } from '@/lib/api/client';
import { AUTH_SESSION_MESSAGE_KEY, clearAuthSession } from '@/lib/auth-session';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';
import { QueryProvider } from '@/lib/react-query/provider';
import { ToastProvider } from '@/components/ui/toast';

function AuthFailureHandler() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    setOnAuthFailure(() => {
      clearAuthSession(queryClient);
      sessionStorage.setItem(AUTH_SESSION_MESSAGE_KEY, ERROR_MESSAGES.SESSION_EXPIRED);
      router.replace('/login');
    });
  }, [queryClient, router]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={getApolloClient()}>
      <ToastProvider>
        <QueryProvider>
          <AuthFailureHandler />
          {children}
        </QueryProvider>
      </ToastProvider>
    </ApolloProvider>
  );
}

export default AppProviders;
