import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VendorState {
  activeStoreId: string | null;
  hasHydrated: boolean;
  setActiveStoreId: (storeId: string | null) => void;
  clearVendor: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set) => ({
      activeStoreId: null,
      hasHydrated: false,
      setActiveStoreId: (storeId) => set({ activeStoreId: storeId }),
      clearVendor: () => set({ activeStoreId: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'sopet-vendor-store',
      partialize: (state) => ({ activeStoreId: state.activeStoreId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
