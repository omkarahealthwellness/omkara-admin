import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getManifest } from '@/lib/kv-manifest';
import { CartTrigger } from '@/components/cart/cart-trigger';

export async function Header() {
  const manifest = await getManifest();
  const logo = manifest?.store.logo.url;
  const storeName = manifest?.store.businessName || 'OMKARA';
  return (
    <header className="app-header flex items-center justify-between px-4 md:px-8 h-14 md:h-[72px] max-w-full mx-auto w-full bg-[#2C1A0F] text-[#FDF5E6]">
      <div className="flex items-center gap-3">
        {logo && (
          <Link href="/">
            <div className="h-8 md:h-10 w-20 md:w-24 relative overflow-hidden flex items-center">
              <OptimizedImage
                src={logo}
                alt={storeName}
                className="object-contain object-left w-full h-full"
              />
            </div>
          </Link>
        )}
      </div>

      <Link href="/" className="absolute left-1/2 -translate-x-1/2">
        <span className="font-serif text-xl md:text-2xl font-bold tracking-widest uppercase text-[#FDF5E6]">
          {storeName}
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <CartTrigger />
      </div>
    </header>
  );
}
