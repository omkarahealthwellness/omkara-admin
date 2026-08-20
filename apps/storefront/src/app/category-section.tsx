'use client';

import { useState } from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/optimized-image';
import type { Category, Product } from '@omkara/core-schemas';

interface CategorySectionProps {
  category: Category;
  products: Product[];
  storeName: string;
}

export function CategorySection({ category, products, storeName }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const isExpandable = products.length > 4;

  return (
    <section id={`cat-${category.id}`} className="scroll-mt-[130px]" aria-label={category.name}>
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-5">
        {category.image?.url && (
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
            <OptimizedImage
              src={category.image.url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">{category.name}</h2>
          <p className="text-[11px] text-muted-foreground">{products.length} items</p>
        </div>
      </div>

      {/* Product Grid */}
      <div 
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 overflow-hidden md:max-h-none transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[5000px]' : 'max-h-[600px]'
        }`}
      >
        {products.map((product) => {
          const price = (product.variants?.[0]?.price || 0) / 100;
          const isSoldOut = product.status === 'SOLD_OUT';
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              {/* Square Image */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                {product.primaryImage?.url ? (
                  <OptimizedImage
                    src={product.primaryImage.url}
                    alt={product.primaryImage.alt || product.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-serif text-sm">
                    {storeName}
                  </div>
                )}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1">
                  {product.name}
                </h3>
                {product.shortDescription && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2 flex-1">
                    {product.shortDescription}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-foreground text-sm">
                    ₹{price % 1 === 0 ? price : price.toFixed(2)}
                  </span>
                  {!isSoldOut && (
                    <span className="text-[10px] font-bold text-primary border border-primary/40 bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wide group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      ADD
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {isExpandable && !expanded && (
        <div className="mt-4 text-center md:hidden relative z-10">
          <div className="absolute -top-12 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          <button 
            onClick={() => setExpanded(true)}
            className="text-primary text-xs font-bold uppercase tracking-wider bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
          >
            Show More {category.name} ↓
          </button>
        </div>
      )}
    </section>
  );
}