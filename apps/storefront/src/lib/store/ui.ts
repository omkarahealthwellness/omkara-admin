import { create } from 'zustand';

interface UIStore {
  isCartSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  toggleSheet: () => void;
}

export const useCartSheet = create<UIStore>((set) => ({
  isCartSheetOpen: false,
  openSheet: () => set({ isCartSheetOpen: true }),
  closeSheet: () => set({ isCartSheetOpen: false }),
  toggleSheet: () => set((state) => ({ isCartSheetOpen: !state.isCartSheetOpen })),
}));
