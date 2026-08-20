import { getManifest } from '@/lib/kv-manifest';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { CategorySection } from './category-section';

export const runtime = 'edge';
export const revalidate = 60; // Fresher content — revalidate every 60s

export default async function Home() {
  const manifest = await getManifest();

  if (!manifest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 px-6">
          <h1 className="text-4xl font-serif text-primary">Coming Soon</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            The storefront is currently being set up. Please publish a manifest from the Admin Dashboard.
          </p>
        </div>
      </div>
    );
  }

  const { hero, store } = manifest;
  const storeName = store.businessName;
  const activeProducts = manifest.products.filter((p) => p.status !== 'HIDDEN');

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* JSON-LD: WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: storeName,
            url: 'https://omkara-store.pages.dev',
          }),
        }}
      />
      {/* JSON-LD: Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: storeName,
            url: 'https://omkara-store.pages.dev',
            logo: store.logo?.url,
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: store.phone,
              contactType: 'customer service',
            },
          }),
        }}
      />
      {/* JSON-LD: ItemList for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `${storeName} Menu`,
            numberOfItems: activeProducts.length,
            itemListElement: activeProducts.slice(0, 20).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: p.name,
                description: p.shortDescription || '',
                url: `https://omkara-store.pages.dev/product/${p.slug}`,
                image: p.primaryImage?.url,
                offers: {
                  '@type': 'Offer',
                  price: ((p.variants?.[0]?.price || 0) / 100).toFixed(2),
                  priceCurrency: 'INR',
                  availability: p.status === 'SOLD_OUT'
                    ? 'https://schema.org/SoldOut'
                    : 'https://schema.org/InStock',
                },
              },
            })),
          }),
        }}
      />

      {/* Hero — Compact, punchy, no heavy effects */}
      <section className="relative h-[40vh] min-h-[280px] md:h-[45vh] flex flex-col items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          {hero.image?.url && (
            <OptimizedImage
              src={hero.image.url}
              alt={`${storeName} — ${hero.heading || 'Premium Wellness'}`}
              className="w-full h-full object-cover"
              objectFit="cover"
              objectPosition={`${hero.focal.x}% ${hero.focal.y}%`}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/60" />
        </div>

        <div className="relative z-10 px-6 max-w-3xl mx-auto space-y-2 text-white">
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-widest drop-shadow-md uppercase">
            {storeName}
          </h1>
          {store.tagline && (
            <p className="text-base md:text-lg tracking-[0.15em] font-medium opacity-90 uppercase">
              {store.tagline}
            </p>
          )}
          <Link
            href="#menu"
            className="inline-block mt-5 px-7 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-full hover:brightness-110 transition-all shadow-md"
          >
            Explore Menu ↓
          </Link>
        </div>
      </section>

      {/* Sticky Category Pills — Swiggy/Zomato style */}
      <CategoryNav categories={manifest.categories} />

      {/* Main Menu */}
      <main id="menu" className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-12">
        {manifest.categories.map((category) => {
          const catProducts = activeProducts.filter((p) => p.categoryId === category.id);
          if (catProducts.length === 0) return null;

          return (
            <CategorySection
              key={category.id}
              category={category}
              products={catProducts}
              storeName={storeName}
            />
          );
        })}
      </main>
    </div>
  );
}
