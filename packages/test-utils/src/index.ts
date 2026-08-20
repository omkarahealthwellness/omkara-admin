/**
 * @omkara/test-utils — Test fixtures and mock builders
 *
 * Provides factory functions for creating valid test data.
 * All fixtures validate against core-schemas (enforced in CI).
 */
import type { Manifest, Product, Category, Tag, CartLine, CartState } from '@omkara/core-schemas';

// ─── Mock Product Builder ───────────────────────────────────────────────────

let productCounter = 0;

export function mockProduct(overrides: Partial<Product> = {}): Product {
  productCounter++;
  const id = crypto.randomUUID();
  return {
    id,
    slug: `product-${productCounter}`,
    categoryId: overrides.categoryId ?? crypto.randomUUID(),
    name: `Test Product ${productCounter}`,
    shortDescription: 'A delicious test product',
    primaryImage: {
      url: 'https://res.cloudinary.com/test/image/upload/v1/product.webp',
      focal: { x: 50, y: 50 },
    },
    gallery: [],
    status: 'AVAILABLE',
    tags: [],
    featuredTagIds: [],
    variants: [
      {
        id: crypto.randomUUID(),
        name: 'Regular',
        price: 4999,
        isDefault: true,
        available: true,
        sortOrder: 0,
      },
    ],
    addons: [],
    note: { enabled: true, maxChars: 250 },
    sortOrder: productCounter,
    ...overrides,
  };
}

// ─── Mock Category Builder ──────────────────────────────────────────────────

let categoryCounter = 0;

export function mockCategory(overrides: Partial<Category> = {}): Category {
  categoryCounter++;
  return {
    id: crypto.randomUUID(),
    slug: `category-${categoryCounter}`,
    name: `Test Category ${categoryCounter}`,
    visible: true,
    sortOrder: categoryCounter,
    displayLimit: 12,
    layoutStyle: 'rail',
    seeAllLabel: 'See all →',
    ...overrides,
  };
}

// ─── Mock Tag Builder ───────────────────────────────────────────────────────

let tagCounter = 0;

export function mockTag(overrides: Partial<Tag> = {}): Tag {
  tagCounter++;
  return {
    id: crypto.randomUUID(),
    name: `Tag ${tagCounter}`,
    icon: '🌿',
    color: '#4A7C59',
    sortOrder: tagCounter,
    ...overrides,
  };
}

// ─── Mock Cart Line Builder ─────────────────────────────────────────────────

export function mockCartLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    lineId: 'mock-line-id',
    productId: crypto.randomUUID(),
    productName: 'Test Product',
    variantId: crypto.randomUUID(),
    variantName: 'Regular',
    addonIds: [],
    addonNames: [],
    note: '',
    quantity: 1,
    unitPrice: 4999,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Mock Cart State Builder ────────────────────────────────────────────────

export function mockCart(overrides: Partial<CartState> = {}): CartState {
  return {
    cartVersion: 1,
    currency: 'INR',
    lines: [],
    orderNote: '',
    lastTouchedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── Mock Manifest Builder ──────────────────────────────────────────────────

export function mockManifest(overrides: Partial<Manifest> = {}): Manifest {
  const category = mockCategory();
  const product = mockProduct({ categoryId: category.id });

  return {
    manifestVersion: 1,
    contentHash: 'sha256:mock-hash-for-testing',
    publishedAt: new Date().toISOString(),
    store: {
      businessName: 'Test Store',
      logo: { url: 'https://res.cloudinary.com/test/image/upload/v1/logo.webp' },
      tagline: 'Fresh & Healthy',
      phone: '9876543210',
      social: {},
      whatsappNumber: '+919876543210',
    },
    navigation: [
      {
        id: crypto.randomUUID(),
        label: 'Home',
        icon: 'HOME',
        url: 'https://example.com',
        visible: true,
        sortOrder: 0,
      },
    ],
    hero: {
      focal: { x: 50, y: 50 },
      overlayOpacity: 40,
      visible: true,
    },
    categories: [category],
    products: [product],
    tags: [mockTag()],
    whatsapp: {
      number: '+919876543210',
      templates: {
        greeting: 'Hi {{businessName}}!',
        order: '{{items}}\n\nTotal: {{total}}',
        footer: 'Thank you!',
      },
    },
    ui: {
      primaryColor: '#4A7C59',
      borderRadius: 'md',
    },
    ...overrides,
  };
}

// ─── Dummy Brand Fixture (Template Universality Proof) ──────────────────────

export function dummyBrandManifest(): Manifest {
  const cat1 = mockCategory({ name: 'Electronics', slug: 'electronics' });
  const cat2 = mockCategory({ name: 'Books', slug: 'books' });
  const cat3 = mockCategory({ name: 'Clothing', slug: 'clothing' });

  return mockManifest({
    store: {
      businessName: 'DummyCo',
      logo: { url: 'https://res.cloudinary.com/test/image/upload/v1/dummy-logo.webp' },
      tagline: 'Everything you need',
      phone: '5551234567',
      social: { facebook: 'https://facebook.com/dummyco' },
      whatsappNumber: '+15551234567',
    },
    categories: [cat1, cat2, cat3],
    products: [
      mockProduct({ name: 'Wireless Mouse', categoryId: cat1.id, slug: 'wireless-mouse' }),
      mockProduct({ name: 'TypeScript Book', categoryId: cat2.id, slug: 'typescript-book' }),
      mockProduct({ name: 'T-Shirt', categoryId: cat3.id, slug: 't-shirt' }),
    ],
    whatsapp: {
      number: '+15551234567',
      templates: {
        greeting: 'Hello from {{businessName}}!',
        order: '{{items}}\n\nTotal: {{total}}',
        footer: 'Thanks for shopping with {{businessName}}!',
      },
    },
    ui: {
      primaryColor: '#2B6CB0',
      borderRadius: 'lg',
    },
  });
}
