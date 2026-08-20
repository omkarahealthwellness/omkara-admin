import Link from 'next/link';
import { CartTrigger } from '@/components/cart/cart-trigger';

export function Header() {
  const storeName = 'OMKARA';
  return (
    <header className="app-header flex items-center justify-between px-4 md:px-8 h-14 md:h-[64px] w-full bg-[#2C1A0F] text-[#FDF5E6]">
      {/* Logo + Brand Name */}
      <Link href="/" className="flex items-center gap-2.5">
        <img
          src="/logo.svg"
          alt={`${storeName} logo`}
          className="h-9 w-9 md:h-10 md:w-10 rounded-full"
          width={40}
          height={40}
        />
        <span className="font-serif text-xl md:text-2xl font-bold tracking-[0.12em] uppercase text-[#FDF5E6]">
          {storeName}
        </span>
      </Link>

      {/* Cart */}
      <div className="flex items-center">
        <CartTrigger />
      </div>
    </header>
  );
}
