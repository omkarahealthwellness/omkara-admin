'use client';

import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartSheet } from '@/lib/store/ui';

export function CartTrigger() {
  const items = useCartStore((state) => state.lines);
  const openSheet = useCartSheet((state) => state.openSheet);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch since localstorage is client-only
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Button
      variant="outline"
      onClick={openSheet}
      className={`border-[#FDF5E6]/30 text-[#FDF5E6] hover:bg-[#FDF5E6]/10 font-medium flex items-center gap-2 bg-transparent transition-transform duration-300 ${
        mounted && totalItems > 0 ? 'scale-105 shadow-[0_0_15px_rgba(253,245,230,0.3)]' : 'scale-100'
      }`}
    >
      <ShoppingBag className={`h-4 w-4 ${mounted && totalItems > 0 ? 'animate-pulse' : ''}`} />
      <span>Cart {mounted && totalItems > 0 ? `(${totalItems})` : ''}</span>
    </Button>
  );
}
