'use client';

import Link from 'next/link';
import { useCartSheet } from '@/lib/store/ui';
import { useCartStore } from '@/lib/store/cart';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const openSheet = useCartSheet((state) => state.openSheet);
  const items = useCartStore((state) => state.lines);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const isHome = pathname === '/';

  return (
    <nav className="bottom-tab-nav">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-1/4 transition-colors ${
          isHome ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Home</span>
      </Link>
      <Link
        href="/#menu"
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4"
      >
        <Search className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">Explore</span>
      </Link>
      <button
        onClick={openSheet}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4 relative"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {mounted && itemsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[8px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-bounce">
              {itemsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold mt-0.5">Cart</span>
      </button>
      <Link
        href="/about"
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors w-1/4"
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-semibold mt-0.5">About</span>
      </Link>
    </nav>
  );
}
