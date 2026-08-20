import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { getManifest } from '@/lib/kv-manifest';
import { CartTrigger } from '@/components/cart/cart-trigger';

export async function Header() {
  const manifest = await getManifest();
  const logo = manifest?.store.logo.url;
  const storeName = manifest?.store.businessName || 'OMKARA';
  return (
    <header className="app-header flex items-center justify-between px-4 md:px-8 h-16 md:h-20 max-w-7xl mx-auto w-full bg-[#2C1A0F] text-[#FDF5E6]">
      <div className="flex-1 flex items-center justify-start">
        {logo && (
          <Link href="/">
            <div className="h-10 md:h-12 w-24 relative overflow-hidden drop-shadow-md flex items-center">
              <OptimizedImage
                src={logo}
                alt={storeName}
                className="object-contain object-left w-full h-full"
              />
            </div>
          </Link>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Link href="/">
          <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest uppercase text-[#FDF5E6] drop-shadow-sm">
            {storeName}
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-end text-[#FFFFF0]">
        <CartTrigger />
      </div>
    </header>
  );
}
