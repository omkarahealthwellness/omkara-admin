import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState, CartLine, hashLine } from '@omkara/core-schemas';

type CartStore = CartState & {
  addItem: (line: Omit<CartLine, 'lineId'>) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartVersion: 1,
      currency: 'INR',
      lines: [],
      orderNote: '',
      lastTouchedAt: new Date().toISOString(),

      addItem: (line) => {
        const lineId = hashLine(line.productId, line.variantId, line.addonIds || []);
        const { lines } = get();
        const existingItemIndex = lines.findIndex((i) => i.lineId === lineId);

        set((state) => {
          const newLines = [...state.lines];
          if (existingItemIndex > -1) {
            newLines[existingItemIndex].quantity += line.quantity;
          } else {
            newLines.push({ ...line, lineId });
          }
          return { lines: newLines, lastTouchedAt: new Date().toISOString() };
        });
      },

      removeItem: (lineId) => {
        set((state) => ({
          lines: state.lines.filter((i) => i.lineId !== lineId),
          lastTouchedAt: new Date().toISOString(),
        }));
      },

      updateQuantity: (lineId, quantity) => {
        set((state) => ({
          lines: state.lines.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
          lastTouchedAt: new Date().toISOString(),
        }));
      },

      clearCart: () => {
        set({ lines: [], lastTouchedAt: new Date().toISOString() });
      },
    }),
    {
      name: 'omkara-cart', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
