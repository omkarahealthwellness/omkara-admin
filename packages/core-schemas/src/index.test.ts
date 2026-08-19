/**
 * Core schemas — unit tests
 *
 * Test battery covering:
 * - Primitives: MoneyPaise, formatPaise, parsePaise, float traps
 * - Product: variant default invariant, paise enforcement
 * - Cart: hashLine determinism, note exclusion, math
 * - WhatsApp: token whitelist, serialization, URL construction
 * - Manifest: strict vs passthrough validation
 * - Security: injection prevention (javascript: URLs, {{evil}} tokens)
 */
import { describe, it, expect } from 'vitest';
import {
  MoneyPaise,
  formatPaise,
  parsePaise,
  Slug,
  HexColor,
  FocalPoint,
  ProductStatus,
  TokenizedString,
  YouTubeId,
  hashLine,
  lineTotal,
  cartTotal,
  VariantSchema,
  AddonSchema,
  ProductSchema,
  CategorySchema,
  TagSchema,
  NavigationItemSchema,
  HeroSchema,
  StoreSettingsSchema,
  WhatsAppTemplatesSchema,
  UIConfigSchema,
  ManifestSchema,
  ManifestSchemaLoose,
  serializeWhatsAppMessage,
  buildWhatsAppUrl,
  WA_MESSAGE_MAX_LENGTH,
} from './index.js';
import type { CartLine, WhatsAppSerializerInput } from './index.js';

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

describe('MoneyPaise', () => {
  it('accepts zero', () => {
    expect(MoneyPaise.parse(0)).toBe(0);
  });

  it('accepts positive integers', () => {
    expect(MoneyPaise.parse(4999)).toBe(4999);
    expect(MoneyPaise.parse(100)).toBe(100);
  });

  it('rejects negative', () => {
    expect(() => MoneyPaise.parse(-1)).toThrow();
  });

  it('rejects floats', () => {
    expect(() => MoneyPaise.parse(49.99)).toThrow();
  });

  it('rejects NaN', () => {
    expect(() => MoneyPaise.parse(NaN)).toThrow();
  });
});

describe('formatPaise', () => {
  it('formats zero', () => {
    expect(formatPaise(0)).toBe('₹0');
  });

  it('formats round rupees (no trailing .00)', () => {
    expect(formatPaise(5000)).toBe('₹50');
  });

  it('formats paise correctly', () => {
    expect(formatPaise(4999)).toBe('₹49.99');
  });

  it('formats single paise', () => {
    expect(formatPaise(1)).toBe('₹0.01');
  });

  it('uses custom currency symbol', () => {
    expect(formatPaise(10000, '$')).toBe('$100');
  });

  it('handles large amounts', () => {
    expect(formatPaise(999999)).toBe('₹9999.99');
  });
});

describe('parsePaise', () => {
  it('converts exact rupees', () => {
    expect(parsePaise(49)).toBe(4900);
  });

  it('converts rupees with paise', () => {
    expect(parsePaise(49.99)).toBe(4999);
  });

  // THE FLOAT TRAP TEST — this is why we use integer paise
  it('rounds correctly (the float trap)', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in IEEE 754
    expect(parsePaise(0.1 + 0.2)).toBe(30);
  });

  it('rounds sub-paise amounts', () => {
    expect(parsePaise(49.999)).toBe(5000);
  });
});

describe('Slug', () => {
  it('accepts valid slugs', () => {
    expect(Slug.parse('mixed-sprouts-100g')).toBe('mixed-sprouts-100g');
  });

  it('rejects uppercase', () => {
    expect(() => Slug.parse('Mixed-Sprouts')).toThrow();
  });

  it('rejects spaces', () => {
    expect(() => Slug.parse('mixed sprouts')).toThrow();
  });

  it('rejects special characters', () => {
    expect(() => Slug.parse('mixed_sprouts!')).toThrow();
  });

  it('rejects too long (>60 chars)', () => {
    expect(() => Slug.parse('a'.repeat(61))).toThrow();
  });
});

describe('HexColor', () => {
  it('accepts valid hex', () => {
    expect(HexColor.parse('#FF5733')).toBe('#FF5733');
  });

  it('rejects without #', () => {
    expect(() => HexColor.parse('FF5733')).toThrow();
  });

  it('rejects short hex', () => {
    expect(() => HexColor.parse('#F53')).toThrow();
  });
});

describe('FocalPoint', () => {
  it('accepts valid focal', () => {
    const result = FocalPoint.parse({ x: 30, y: 70 });
    expect(result.x).toBe(30);
    expect(result.y).toBe(70);
  });

  it('rejects out-of-range', () => {
    expect(() => FocalPoint.parse({ x: 120, y: 50 })).toThrow();
  });

  it('defaults to center', () => {
    const result = FocalPoint.parse({});
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
  });
});

describe('ProductStatus', () => {
  it('accepts all valid statuses', () => {
    const statuses = [
      'AVAILABLE',
      'FRESHLY_PREPARED',
      'LOW_AVAILABILITY',
      'SOLD_OUT',
      'COMING_SOON',
      'HIDDEN',
    ];
    statuses.forEach((s) => expect(ProductStatus.parse(s)).toBe(s));
  });

  it('rejects invalid status', () => {
    expect(() => ProductStatus.parse('DELETED')).toThrow();
  });
});

describe('TokenizedString', () => {
  it('accepts plain text', () => {
    expect(TokenizedString.parse('Hello, welcome!')).toBe('Hello, welcome!');
  });

  it('accepts whitelisted tokens', () => {
    expect(TokenizedString.parse('Total: {{total}}')).toBe('Total: {{total}}');
    expect(TokenizedString.parse('{{items}} — {{total}}')).toBeTruthy();
  });

  it('rejects unknown tokens', () => {
    expect(() => TokenizedString.parse('{{evil}}')).toThrow();
  });

  it('rejects prototype pollution attempt', () => {
    expect(() => TokenizedString.parse('{{constructor}}')).toThrow();
  });

  it('rejects __proto__ injection', () => {
    expect(() => TokenizedString.parse('{{__proto__}}')).toThrow();
  });
});

describe('YouTubeId', () => {
  it('accepts valid 11-char ID', () => {
    expect(YouTubeId.parse('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('rejects too short', () => {
    expect(() => YouTubeId.parse('dQw4w9')).toThrow();
  });

  it('rejects full URL', () => {
    expect(() => YouTubeId.parse('https://youtube.com/watch?v=dQw4w9WgXcQ')).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════════════════════════

describe('VariantSchema', () => {
  const validVariant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Medium',
    price: 4999,
    isDefault: true,
    available: true,
    sortOrder: 0,
  };

  it('accepts valid variant', () => {
    expect(VariantSchema.parse(validVariant)).toEqual(validVariant);
  });

  it('rejects float price', () => {
    expect(() => VariantSchema.parse({ ...validVariant, price: 49.99 })).toThrow();
  });

  it('rejects negative price', () => {
    expect(() => VariantSchema.parse({ ...validVariant, price: -100 })).toThrow();
  });

  it('rejects extra fields (strict mode)', () => {
    expect(() => VariantSchema.parse({ ...validVariant, hackerField: true })).toThrow();
  });
});

describe('ProductSchema', () => {
  const validProduct = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    slug: 'mixed-sprouts',
    categoryId: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Mixed Sprouts',
    primaryImage: {
      url: 'https://res.cloudinary.com/test/image/upload/v1/product.webp',
      focal: { x: 50, y: 50 },
    },
    status: 'AVAILABLE' as const,
    tags: [],
    featuredTagIds: [],
    variants: [
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: '100g',
        price: 4999,
        isDefault: true,
        available: true,
        sortOrder: 0,
      },
    ],
    addons: [],
    note: { enabled: true, maxChars: 250 },
    sortOrder: 0,
  };

  it('accepts valid product', () => {
    expect(() => ProductSchema.parse(validProduct)).not.toThrow();
  });

  it('rejects zero variants', () => {
    expect(() => ProductSchema.parse({ ...validProduct, variants: [] })).toThrow();
  });

  it('rejects no default variant', () => {
    const noDefault = {
      ...validProduct,
      variants: [{ ...validProduct.variants[0]!, isDefault: false }],
    };
    expect(() => ProductSchema.parse(noDefault)).toThrow();
  });

  it('rejects two default variants', () => {
    const twoDefaults = {
      ...validProduct,
      variants: [
        { ...validProduct.variants[0]! },
        {
          id: '123e4567-e89b-12d3-a456-426614174004',
          name: '200g',
          price: 7999,
          isDefault: true,
          available: true,
          sortOrder: 1,
        },
      ],
    };
    expect(() => ProductSchema.parse(twoDefaults)).toThrow();
  });

  it('rejects more than 2 featured tags', () => {
    expect(() =>
      ProductSchema.parse({
        ...validProduct,
        featuredTagIds: [
          '123e4567-e89b-12d3-a456-426614174005',
          '123e4567-e89b-12d3-a456-426614174006',
          '123e4567-e89b-12d3-a456-426614174007',
        ],
      }),
    ).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION (URL INJECTION PREVENTION)
// ═══════════════════════════════════════════════════════════════════════════

describe('NavigationItemSchema', () => {
  const validNavItem = {
    id: '123e4567-e89b-12d3-a456-426614174010',
    label: 'Instagram',
    icon: 'INSTAGRAM' as const,
    url: 'https://instagram.com/example',
    visible: true,
    sortOrder: 0,
  };

  it('accepts https URL', () => {
    expect(() => NavigationItemSchema.parse(validNavItem)).not.toThrow();
  });

  it('accepts tel: URL', () => {
    expect(() =>
      NavigationItemSchema.parse({ ...validNavItem, url: 'tel:+919876543210' }),
    ).not.toThrow();
  });

  it('accepts mailto: URL', () => {
    expect(() =>
      NavigationItemSchema.parse({ ...validNavItem, url: 'mailto:test@example.com' }),
    ).not.toThrow();
  });

  it('REJECTS javascript: URL (XSS prevention)', () => {
    expect(() =>
      NavigationItemSchema.parse({ ...validNavItem, url: 'javascript:alert(1)' }),
    ).toThrow();
  });

  it('REJECTS data: URL', () => {
    expect(() =>
      NavigationItemSchema.parse({ ...validNavItem, url: 'data:text/html,<script>alert(1)</script>' }),
    ).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CART HASHING
// ═══════════════════════════════════════════════════════════════════════════

describe('hashLine', () => {
  it('is deterministic', () => {
    const hash1 = hashLine('prod1', 'var1', ['addon1', 'addon2']);
    const hash2 = hashLine('prod1', 'var1', ['addon1', 'addon2']);
    expect(hash1).toBe(hash2);
  });

  it('sorts addon IDs (order-independent)', () => {
    const hash1 = hashLine('prod1', 'var1', ['addon2', 'addon1']);
    const hash2 = hashLine('prod1', 'var1', ['addon1', 'addon2']);
    expect(hash1).toBe(hash2);
  });

  it('different variant = different hash', () => {
    const hash1 = hashLine('prod1', 'var1', []);
    const hash2 = hashLine('prod1', 'var2', []);
    expect(hash1).not.toBe(hash2);
  });

  it('different addons = different hash', () => {
    const hash1 = hashLine('prod1', 'var1', ['addon1']);
    const hash2 = hashLine('prod1', 'var1', ['addon2']);
    expect(hash1).not.toBe(hash2);
  });

  it('returns 8-char hex string', () => {
    const hash = hashLine('prod1', 'var1', []);
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CART MATH (integer paise — the float trap test battery)
// ═══════════════════════════════════════════════════════════════════════════

describe('lineTotal', () => {
  it('calculates with no addons', () => {
    expect(lineTotal(4999, [], 2)).toBe(9998);
  });

  it('calculates with addons', () => {
    expect(lineTotal(4999, [1000, 500], 1)).toBe(6499);
  });

  it('calculates qty 99', () => {
    expect(lineTotal(100, [], 99)).toBe(9900);
  });

  it('handles zero price (free sample)', () => {
    expect(lineTotal(0, [], 1)).toBe(0);
  });

  it('handles 12 addons', () => {
    const addons = Array.from({ length: 12 }, () => 100);
    expect(lineTotal(1000, addons, 1)).toBe(2200);
  });
});

describe('cartTotal', () => {
  it('sums line totals', () => {
    const lines: CartLine[] = [
      {
        lineId: 'a',
        productId: 'p1',
        productName: 'Item 1',
        variantId: 'v1',
        variantName: 'Sm',
        addonIds: [],
        addonNames: [],
        note: '',
        quantity: 2,
        unitPrice: 5000,
        addedAt: '2026-01-01T00:00:00Z',
      },
      {
        lineId: 'b',
        productId: 'p2',
        productName: 'Item 2',
        variantId: 'v2',
        variantName: 'Lg',
        addonIds: [],
        addonNames: [],
        note: '',
        quantity: 1,
        unitPrice: 3000,
        addedAt: '2026-01-01T00:00:00Z',
      },
    ];
    expect(cartTotal(lines)).toBe(13000); // (5000*2) + (3000*1)
  });

  it('handles empty cart', () => {
    expect(cartTotal([])).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP SERIALIZER
// ═══════════════════════════════════════════════════════════════════════════

describe('WhatsApp serializer', () => {
  const mockInput: WhatsAppSerializerInput = {
    greeting: 'Hi {{businessName}}!',
    orderTemplate: '',
    footer: 'Thank you! — {{businessName}}',
    whatsappNumber: '+919876543210',
    businessName: 'Test Store',
    lines: [
      {
        lineId: 'a',
        productId: 'p1',
        productName: 'Mixed Sprouts',
        variantId: 'v1',
        variantName: '100g',
        addonIds: [],
        addonNames: [],
        note: 'extra spicy',
        quantity: 2,
        unitPrice: 4999,
        addedAt: '2026-01-01T00:00:00Z',
      },
    ],
    orderNote: 'Please deliver fast',
    total: 9998,
  };

  it('serializes a message with all parts', () => {
    const msg = serializeWhatsAppMessage(mockInput);
    expect(msg).toContain('Hi Test Store!');
    expect(msg).toContain('Mixed Sprouts');
    expect(msg).toContain('100g');
    expect(msg).toContain('extra spicy');
    expect(msg).toContain('₹99.98');
    expect(msg).toContain('Please deliver fast');
    expect(msg).toContain('Thank you! — Test Store');
  });

  it('builds correct wa.me URL', () => {
    const url = buildWhatsAppUrl(mockInput);
    expect(url).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
    expect(url).toContain(encodeURIComponent('Mixed Sprouts'));
  });

  it('strips + from E.164 number', () => {
    const url = buildWhatsAppUrl(mockInput);
    expect(url).not.toContain('%2B'); // + should not appear encoded
    expect(url).toContain('wa.me/919876543210');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// STORE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

describe('StoreSettingsSchema', () => {
  it('accepts valid E.164 WhatsApp number', () => {
    const valid = {
      id: 'main' as const,
      businessName: 'Test Store',
      logoUrl: 'https://example.com/logo.webp',
      phone: '9876543210',
      social: {},
      whatsappNumber: '+919876543210',
    };
    expect(() => StoreSettingsSchema.parse(valid)).not.toThrow();
  });

  it('rejects WhatsApp number without +', () => {
    const invalid = {
      id: 'main' as const,
      businessName: 'Test Store',
      logoUrl: 'https://example.com/logo.webp',
      phone: '9876543210',
      social: {},
      whatsappNumber: '919876543210',
    };
    expect(() => StoreSettingsSchema.parse(invalid)).toThrow();
  });
});
