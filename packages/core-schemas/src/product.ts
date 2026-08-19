/**
 * Product-related schemas: Variant, Addon, Product.
 *
 * Design decisions documented in implementation_plan.md Conflict Resolutions:
 * - Variant uses simple `available: boolean` (not full ProductStatus enum) — Conflict #12
 * - Addon has both per-addon `maxSelect` AND product-level `maxAddonSelection` — Conflict #13
 * - Note is explicitly excluded from cart line hash — Conflict #5
 * - Money is integer paise everywhere — Conflict #4
 */
import { z } from 'zod';
import { MoneyPaise, Slug, FocalPoint, ProductStatus, UUID, MediaAssetSchema } from './primitives';

// ─── Variant ────────────────────────────────────────────────────────────────

export const VariantSchema = z
  .object({
    id: UUID, // [locked]
    name: z.string().min(1).max(30), // [content] — "100g", "Small", "Family"
    price: MoneyPaise, // [content] — integer paise
    isDefault: z.boolean().default(false), // [config]
    available: z.boolean().default(true), // [content] — simple boolean, not full status enum
    sortOrder: z.number().int().min(0), // [config]
  })
  .strict();

export type Variant = z.infer<typeof VariantSchema>;

// ─── Addon ──────────────────────────────────────────────────────────────────

export const AddonSchema = z
  .object({
    id: UUID, // [locked]
    name: z.string().min(1).max(40), // [content]
    price: MoneyPaise, // [content] — integer paise
    required: z.boolean().default(false), // [config] — "Choose a base (required)"
    maxSelect: z.number().int().min(1).max(10).default(1), // [config] — per-addon cap
    available: z.boolean().default(true), // [content]
    sortOrder: z.number().int().min(0), // [config]
  })
  .strict();

export type Addon = z.infer<typeof AddonSchema>;

// ─── Product ────────────────────────────────────────────────────────────────

export const ProductSchema = z
  .object({
    id: UUID, // [locked]
    slug: Slug, // [locked] — stable, used in URLs, never editable post-creation
    categoryId: UUID, // [content]
    name: z.string().min(1).max(60), // [content]
    shortDescription: z.string().max(80).optional(), // [content]
    longDescription: z.string().max(500).optional(), // [content]
    primaryImage: MediaAssetSchema.extend({
      focal: FocalPoint,
    }), // [content]
    gallery: z.array(MediaAssetSchema).max(4).default([]), // [content]
    video: z
      .object({
        youtubeId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/),
      })
      .optional(), // [content]
    status: ProductStatus.default('AVAILABLE'), // [content]
    tags: z.array(UUID).max(6).default([]), // [content] — tag ID references
    featuredTagIds: z.array(UUID).max(2).default([]), // [content] — ≤2 shown on card
    variants: z
      .array(VariantSchema)
      .min(1)
      .max(8)
      .refine((v) => v.filter((x) => x.isDefault).length === 1, {
        message: 'Exactly one variant must be marked as default',
      }), // [config] structure, [content] values
    addons: z.array(AddonSchema).max(12).default([]), // [config/content]
    maxAddonSelection: z.number().int().min(0).optional(), // [config] — product-level cap
    note: z.object({
      enabled: z.boolean().default(true), // [config]
      maxChars: z.number().int().max(250).default(250), // [config]
      placeholder: z.string().max(60).optional(), // [config]
    }),
    sortOrder: z.number().int().min(0), // [config]
  })
  .strict();

export type Product = z.infer<typeof ProductSchema>;
