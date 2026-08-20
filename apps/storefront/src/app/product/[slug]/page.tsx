import { getManifest } from '@/lib/kv-manifest';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { AddToCartButton } from './add-to-cart-button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import type { Metadata } from 'next';

export const runtime = 'edge';
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const manifest = await getManifest();
  if (!manifest) return {};
  const product = manifest.products.find((p) => p.slug === params.slug);
  if (!product) return {};
  const price = ((product.variants?.[0]?.price || 0) / 100).toFixed(2);
  return {
    title: `${product.name} — ₹${price}`,
    description: product.shortDescription || `Buy ${product.name} from Omkara. Premium quality health food.`,
    openGraph: {
      title: `${product.name} — Omkara`,
      description: product.shortDescription || product.name,
      images: product.primaryImage?.url ? [{ url: product.primaryImage.url, alt: product.name }] : [],
      url: `https://omkara-store.pages.dev/product/${product.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — Omkara`,
      description: product.shortDescription || product.name,
      images: product.primaryImage?.url ? [product.primaryImage.url] : [],
    },
    alternates: {
      canonical: `https://omkara-store.pages.dev/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const manifest = await getManifest();
  if (!manifest) return notFound();

  const product = manifest.products.find((p) => p.slug === params.slug && p.status !== 'HIDDEN');
  if (!product) return notFound();

  const isOutOfStock = product.status === 'SOLD_OUT' || product.status === 'COMING_SOON';

  return (
    <div className="min-h-screen bg-sandstone/10 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.primaryImage?.url ? [product.primaryImage.url] : [],
            description: product.shortDescription || product.name,
            sku: product.id,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: ((product.variants?.[0]?.price || 0) / 100).toFixed(2),
              availability: isOutOfStock
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
              url: `https://omkara-store.pages.dev/product/${product.slug}`,
            },
          }),
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
          {/* Image Gallery (Placeholder for 4.6 media) */}
          <div className="aspect-square bg-white border rounded-2xl overflow-hidden shadow-sm relative">
            {product.primaryImage?.url ? (
              <OptimizedImage
                src={product.primaryImage.url}
                alt={product.name}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-sandstone/20">
                <span className="text-lg font-serif italic text-crimson-spice/50">
                  Omkara Premium
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {product.categoryId.replace('cat_', '')}
                </span>
                {!isOutOfStock && (
                  <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3 mr-1" />{' '}
                    {product.status === 'AVAILABLE' ? 'In Stock' : product.status}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-end gap-4 pb-4 border-b">
                <span className="text-3xl font-bold text-crimson-spice">
                  ₹{((product.variants?.[0]?.price || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="prose prose-stone">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {product.name} - Premium quality.
              </p>
            </div>

            {/* Tags / Badges */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-desert-gold/20 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-desert-gold/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-8 border-t">
              <AddToCartButton product={product} disabled={isOutOfStock} />
            </div>

            {/* Authenticity guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-8 text-center border-t">
              <div className="space-y-1">
                <div className="mx-auto w-10 h-10 rounded-full bg-sandstone flex items-center justify-center text-crimson-spice font-serif font-bold text-lg">
                  100%
                </div>
                <p className="text-xs font-medium text-muted-foreground">Authentic</p>
              </div>
              <div className="space-y-1">
                <div className="mx-auto w-10 h-10 rounded-full bg-sandstone flex items-center justify-center text-crimson-spice font-serif font-bold text-lg">
                  Org
                </div>
                <p className="text-xs font-medium text-muted-foreground">Organic Base</p>
              </div>
              <div className="space-y-1">
                <div className="mx-auto w-10 h-10 rounded-full bg-sandstone flex items-center justify-center text-crimson-spice font-serif font-bold text-lg">
                  24h
                </div>
                <p className="text-xs font-medium text-muted-foreground">Dispatch</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
