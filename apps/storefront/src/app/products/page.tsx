import { getManifest } from '@/lib/kv-manifest';
import { CategorySection } from '../category-section';
import { CategoryNav } from '../category-nav';

export const runtime = 'edge';
export const revalidate = 60;

export default async function ProductsPage() {
  const manifest = await getManifest();

  if (!manifest) {
    return (
      <div className=" min-h-[50vh] flex items-center justify-center\>
 <div className=\text-center space-y-4 px-6\>
 <h1 className=\text-3xl font-serif text-primary\>Catalog Loading</h1>
 <p className=\text-muted-foreground max-w-md mx-auto\>
 The menu is being refreshed. Please check back shortly.
 </p>
 </div>
 </div>
 );
 }

 const { store } = manifest;
 const storeName = store.businessName;
 const activeProducts = manifest.products.filter((p) => p.status !== 'HIDDEN');

 return (
 <div className=\min-h-screen bg-background flex flex-col font-sans py-8\>
 <div className=\max-w-7xl mx-auto px-4 md:px-8 mb-6\>
 <h1 className=\text-3xl md:text-4xl font-serif font-bold text-foreground\>
 Shop All Products
 </h1>
 <p className=\text-sm text-muted-foreground mt-1\>
 Browse our entire selection of fresh sprouted nutrition, organic mixes, and wellness superfoods.
 </p>
 </div>

 <CategoryNav categories={manifest.categories} />

 <main className=\flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-12\>
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