import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchAuthSession, hasAuthCompanionCookie } from '@/lib/auth/client-session';
import type { User } from '@/types';

const AUTH_STORAGE_KEY = 'sopet-admin-auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        queueMicrotask(() => {
          void syncAuthFromSessionApi();
        });
      },
    },
  ),
);

async function syncAuthFromSessionApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  if (!hasAuthCompanionCookie() && !useAuthStore.getState().isAuthenticated) {
    return;
  }

  try {
    const session = await fetchAuthSession();

    if (!session.authenticated || !session.role) {
      if (useAuthStore.getState().isAuthenticated) {
        useAuthStore.getState().clearAuth();
      }
      return;
    }

    const current = useAuthStore.getState().user;
    if (current) {
      useAuthStore.getState().setUser({
        ...current,
        role: session.role,
        storeId: session.storeId ?? current.storeId,
      });
      return;
    }

    useAuthStore.getState().setUser({
      id: 'session',
      email: '',
      fullName: '',
      role: session.role,
      storeId: session.storeId ?? undefined,
    });
  } catch {
    // Best-effort sync during hydration; tests/offline callers may not have fetch.
  }
}

// Each tab hydrates this store from localStorage exactly once, at module load. With no
// cross-tab sync, a tab left open on /login before a sibling tab logs in keeps a stale
// isAuthenticated:false forever - so guard checks in that tab (AuthGuard, /register,
// /login) never see the login and can bounce the user back to /login even though the
// cookie/localStorage both already say authenticated (row 38 regression). Re-hydrating
// on the storage event keeps every open tab's in-memory auth state converged with
// whichever tab last logged in or out.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === AUTH_STORAGE_KEY) {
      void useAuthStore.persist.rehydrate();
    }
  });
}
