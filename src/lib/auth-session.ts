import type { QueryClient } from '@tanstack/react-query';
import { clearTokens, getAccessToken } from '@/lib/api/client';
import { getMe } from '@/lib/api/auth';
import { getApolloClient } from '@/lib/graphql/client';
import { isAccessTokenUsable } from '@/lib/jwt';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import type { User } from '@/types';

export const AUTH_SESSION_MESSAGE_KEY = 'sopet_auth_message';

/** Drops TanStack Query and Apollo caches so the next session cannot read prior user data. */
export function resetSessionCaches(queryClient: QueryClient): void {
  queryClient.clear();
  void getApolloClient().clearStore();
}

/** Clears tokens, persisted auth/vendor state, and all client-side data caches. */
export function clearAuthSession(queryClient: QueryClient): void {
  clearTokens();
  useAuthStore.getState().clearAuth();
  useVendorStore.getState().clearVendor();
  resetSessionCaches(queryClient);
}

/** Optimistically marks the current session user as email-verified. */
export function markEmailVerified(): void {
  const { user } = useAuthStore.getState();
  if (!user || user.emailVerified === true) {
    return;
  }
  useAuthStore.getState().setUser({ ...user, emailVerified: true });
}

/** Marks email verified locally and refreshes profile from `me` when possible. */
export async function syncEmailVerificationStatus(): Promise<void> {
  markEmailVerified();
  await refreshAuthUser();
}

/** Refreshes the persisted auth user from the `me` query when a valid token exists. */
export async function refreshAuthUser(): Promise<User | null> {
  const { user, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || !user) {
    return null;
  }

  const accessToken = getAccessToken();
  if (!isAccessTokenUsable(accessToken)) {
    return user;
  }

  try {
    const freshUser = await getMe();
    const mergedUser: User = {
      ...user,
      ...freshUser,
      storeId: freshUser.storeId ?? user.storeId,
    };
    useAuthStore.getState().setUser(mergedUser);
    return mergedUser;
  } catch {
    return user;
  }
}
