import { fetchAuthSession } from '@/lib/auth/client-session';
import { useAuthStore } from '@/stores/auth.store';
import { useVendorStore } from '@/stores/vendor.store';
import type { User } from '@/types';

/** After BFF sets HttpOnly cookies, sync Zustand user + optional storeId from session. */
export async function applyAuthenticatedSession(user: User): Promise<User> {
  const session = await fetchAuthSession();
  const storeId = session.storeId ?? user.storeId ?? undefined;
  const nextUser = { ...user, storeId };
  useAuthStore.getState().setUser(nextUser);
  if (storeId) {
    useVendorStore.getState().setActiveStoreId(storeId);
  }
  return nextUser;
}
