/**
 * Manifest schema — the ONLY shape the storefront ever sees.
 *
 * Design decisions:
 * - `manifestVersion` enables forward migrations (storefront uses .passthrough())
 * - `contentHash` enables corruption detection (storefront verifies before render)
 * - HIDDEN products are excluded at compile time, never reach the manifest
 * - Admin uses ManifestSchema.strict(), storefront uses ManifestSchemaLoose (.passthrough())
 */
import { z } from 'zod';
import {
  StoreSettingsSchema,
  NavigationItemSchema,
  HeroSchema,
  WhatsAppTemplatesSchema,
  UIConfigSchema,
} from './store';
import { CategorySchema } from './category';
import { ProductSchema } from './product';
import { TagSchema } from './tag';

// ─── Strict Manifest (used by admin at publish time) ────────────────────────

export const ManifestSchema = z.object({
  manifestVersion: z.number().int().positive(),
  contentHash: z.string(), // sha256 of serialized content (excluding this field)
  publishedAt: z.string().datetime(),
  store: StoreSettingsSchema.omit({ id: true }),
  navigation: z.array(NavigationItemSchema),
  hero: HeroSchema,
  categories: z.array(CategorySchema),
  products: z.array(ProductSchema),
  tags: z.array(TagSchema),
  whatsapp: z.object({
    number: z.string().regex(/^\+\d{10,15}$/),
    templates: WhatsAppTemplatesSchema,
  }),
  ui: UIConfigSchema,
});

export type Manifest = z.infer<typeof ManifestSchema>;

// ─── Loose Manifest (used by storefront — tolerates unknown fields) ─────────

export const ManifestSchemaLoose = ManifestSchema.passthrough();

// ─── LATEST pointer (tiny JSON fetched every 30s by storefront) ─────────────

export const LatestPointerSchema = z.object({
  version: z.number().int().positive(),
});

export type LatestPointer = z.infer<typeof LatestPointerSchema>;

// ─── Constants ──────────────────────────────────────────────────────────────

/** Current manifest schema version. Bump when schema shape changes. */
export const CURRENT_MANIFEST_VERSION = 1;

/** Maximum manifest size in bytes (300KB). Publish refuses if exceeded. */
export const MAX_MANIFEST_SIZE_BYTES = 300 * 1024;
