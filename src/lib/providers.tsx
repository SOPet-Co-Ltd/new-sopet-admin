'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApolloProvider } from '@apollo/client/react';
import { getApolloClient } from '@/lib/graphql/client';
import { setOnAuthFailure } from '@/lib/api/client';
import { AUTH_SESSION_MESSAGE_KEY } from '@/lib/auth-session';
import { ERROR_MESSAGES } from '@/lib/api/error-messages';
import { QueryProvider } from '@/lib/react-query/provider';
import { ToastProvider } from '@/components/ui/toast';
import { useAuthStore } from '@/stores/auth.store';

function AuthFailureHandler() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  useEffect(() => {
    setOnAuthFailure(() => {
      clearAuth();
      sessionStorage.setItem(AUTH_SESSION_MESSAGE_KEY, ERROR_MESSAGES.SESSION_EXPIRED);
      router.replace('/login');
    });
  }, [clearAuth, router]);

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
