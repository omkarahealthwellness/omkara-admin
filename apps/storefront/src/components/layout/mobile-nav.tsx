'use client';

import Link from 'next/link';
import { useCartSheet } from '@/lib/store/ui';
import { useCartStore } from '@/lib/store/cart';
import { Home, Compass, ShoppingBag, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MobileNav() {
  const openSheet = useCartSheet((state) => state.openSheet);
  const items = useCartStore((state) => state.lines);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bottom-tab-nav">
      <Link href="/" className="flex flex-col items-center justify-center text-primary w-1/4">
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium mt-1">Home</span>
      </Link>
      <Link
        href="/#menu"
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4"
      >
        <Compass className="h-5 w-5" />
        <span className="text-[10px] font-medium mt-1">Explore</span>
      </Link>
      <div
        onClick={openSheet}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4 cursor-pointer relative"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {mounted && itemsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full">
              {itemsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium mt-1">Cart</span>
      </div>
      <Link
        href="/about"
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-medium mt-1">More</span>
      </Link>
    </nav>
  );
}
