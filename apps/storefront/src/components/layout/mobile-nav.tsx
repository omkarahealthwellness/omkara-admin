'use client';

import Link from 'next/link';
import { useCartSheet } from '@/lib/store/ui';
import { useCartStore } from '@/lib/store/cart';
import { Home, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function MobileNav() {
  const openSheet = useCartSheet((state) => state.openSheet);
  const items = useCartStore((state) => state.lines);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const isHome = pathname === '/';

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('menu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bottom-tab-nav" aria-label="Mobile Navigation">
      <Link
        href="/"
        onClick={handleHomeClick}
        className={`flex flex-col items-center justify-center flex-1 transition-colors ${
          isHome ? 'text-primary' : 'text-muted-foreground hover:text-primary'
        }`}
      >
        <Home className="h-5 w-5" />
        <span className="text-[11px] font-semibold mt-0.5">Home</span>
      </Link>

      <Link
        href="/#menu"
        onClick={handleMenuClick}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-1"
      >
        <UtensilsCrossed className="h-5 w-5" />
        <span className="text-[11px] font-semibold mt-0.5">Menu</span>
      </Link>

      <button
        type="button"
        onClick={openSheet}
        className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-1 relative"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {mounted && itemsCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground text-[9px] font-bold h-4 min-w-4 px-1 flex items-center justify-center rounded-full animate-bounce">
              {itemsCount}
            </span>
          )}
        </div>
        <span className="text-[11px] font-semibold mt-0.5">Cart</span>
      </button>
    </nav>
  );
}
