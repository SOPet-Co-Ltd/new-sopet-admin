import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VendorState {
  activeStoreId: string | null;
  setActiveStoreId: (storeId: string | null) => void;
  clearVendor: () => void;
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set) => ({
      activeStoreId: null,
      setActiveStoreId: (storeId) => set({ activeStoreId: storeId }),
      clearVendor: () => set({ activeStoreId: null }),
    }),
    {
      name: 'sopet-vendor-store',
      partialize: (state) => ({ activeStoreId: state.activeStoreId }),
    },
  ),
);
