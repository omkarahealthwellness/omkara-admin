import { getManifest } from '@/lib/kv-manifest';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  const manifest = await getManifest();

  if (!manifest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sandstone">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif text-crimson-spice">Coming Soon</h1>
          <p className="text-muted-foreground">
            The storefront is currently being set up. Please publish a manifest from the Admin
            Dashboard.
          </p>
        </div>
      </div>
    );
  }

  const { hero, navigation, store } = manifest;
  const storeName = store.businessName;
  const activeProducts = manifest.products.filter((p) => p.status !== 'HIDDEN');

  return (
    <div className="min-h-screen bg-sandstone/10 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: storeName,
            url: 'https://omkara.com',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: storeName,
            url: 'https://omkara.com',
            logo: manifest.store.logo.url,
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex flex-col items-center justify-center overflow-hidden text-center bg-sandstone">
        <div className="absolute inset-0 z-0">
          {hero.image?.url && (
            <OptimizedImage
              src={hero.image.url}
              alt={hero.heading || 'Hero Background'}
              className="w-full h-full object-cover opacity-90"
              objectFit="cover"
              objectPosition={`${hero.focal.x}% ${hero.focal.y}%`}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 px-4 max-w-4xl mx-auto space-y-4 text-white">
          <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-widest drop-shadow-lg uppercase">
            {storeName}
          </h1>
          {store.tagline && (
            <p className="text-xl md:text-2xl font-sans tracking-[0.2em] font-medium opacity-90 uppercase">
              {store.tagline}
            </p>
          )}

          <div className="pt-12">
            <h2 className="text-2xl md:text-4xl font-serif mb-8">{hero.heading}</h2>
            <Link href="#menu">
              <p className="text-sm tracking-[0.3em] font-bold uppercase opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                Explore {storeName}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky Category Dropdown (Simulated with Nav) */}
      <nav className="sticky top-[60px] md:top-[70px] z-40 bg-background/95 backdrop-blur border-b border-border py-3 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto no-scrollbar pb-1">
          <Link
            href="#menu"
            className="whitespace-nowrap px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
          >
            All Products
          </Link>
          {manifest.categories.map((cat) => (
            <Link
              key={cat.id}
              href={`#cat-${cat.id}`}
              className="whitespace-nowrap px-4 py-2 rounded-full border border-border hover:bg-muted text-sm font-medium transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Menu Container */}
      <main id="menu" className="flex-1 py-12 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-16">
        {manifest.categories.map((category) => {
          const catProducts = activeProducts.filter((p) => p.categoryId === category.id);
          if (catProducts.length === 0) return null;

          return (
            <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-[120px]">
              <div className="mb-8 border-b border-border pb-4">
                <h2 className="text-3xl font-serif font-bold text-foreground">{category.name}</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {catProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group bg-card rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="aspect-[4/5] bg-muted relative overflow-hidden">
                      {product.primaryImage?.url ? (
                        <OptimizedImage
                          src={product.primaryImage.url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-sandstone/30 font-serif">
                          Omkara
                        </div>
                      )}
                      {product.status === 'SOLD_OUT' && (
                        <div className="absolute top-2 right-2 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                          Sold Out
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-serif font-semibold text-foreground text-lg leading-tight mb-1">
                        {product.name}
                      </h3>
                      {product.shortDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          ₹{((product.variants?.[0]?.price || 0) / 100).toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                          ADD +
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-12 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <img src="/logo.svg" alt="Logo" className="h-10 mx-auto mb-6 opacity-80" />
          <p className="text-sm text-muted-foreground font-serif">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
