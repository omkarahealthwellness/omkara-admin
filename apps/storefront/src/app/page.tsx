import { getManifest } from "@/lib/kv-manifest";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const runtime = "edge";
export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  const manifest = await getManifest();

  if (!manifest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sandstone">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif text-crimson-spice">Coming Soon</h1>
          <p className="text-muted-foreground">The storefront is currently being set up. Please publish a manifest from the Admin Dashboard.</p>
        </div>
      </div>
    );
  }

  const { hero, navigation, store } = manifest;
  const storeName = store.businessName;
  const activeProducts = manifest.products.filter(p => p.status !== "HIDDEN");

  return (
    <div className="min-h-screen bg-sandstone/10 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": storeName,
            "url": "https://omkara.com"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": storeName,
            "url": "https://omkara.com",
            "logo": manifest.store.logo.url
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-sandstone">
          {hero.image?.url && (
            <OptimizedImage 
              src={hero.image.url} 
              alt={hero.heading || "Hero Background"} 
              className="w-full h-full object-cover"
              objectFit="cover"
              objectPosition={`${hero.focal.x}% ${hero.focal.y}%`}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-6 text-white">
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight drop-shadow-lg">
            {hero.heading}
          </h1>
          {hero.subheading && (
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-md">
              {hero.subheading}
            </p>
          )}
          <div className="pt-4">
            <Link href="/products">
              <Button size="lg" className="bg-desert-gold hover:bg-desert-gold/90 text-black font-bold text-lg px-8 py-6 h-auto border-none">
                View Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <main className="flex-1 py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900">Featured Collections</h2>
          <p className="text-muted-foreground mt-2">Handpicked premium selections.</p>
        </div>
        
        {activeProducts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg border border-dashed">
            <p className="text-muted-foreground">No active products found in the catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.primaryImage?.url ? (
                    <OptimizedImage src={product.primaryImage.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-sandstone/30">
                      No Image
                    </div>
                  )}
                  {product.status === "SOLD_OUT" && (
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                      Sold Out
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.categoryId}</p>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold text-crimson-spice">₹{((product.variants?.[0]?.price || 0) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-12 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <img src="/logo.svg" alt="Logo" className="h-10 mx-auto mb-6 opacity-80" />
          <p className="text-sm text-muted-foreground font-serif">&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
