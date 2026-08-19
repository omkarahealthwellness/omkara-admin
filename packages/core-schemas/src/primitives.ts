/**
 * Primitive types and utility schemas used across all entities.
 * These are the atomic building blocks — every other schema composes from these.
 *
 * Money is ALWAYS integer paise (1 rupee = 100 paise).
 * This eliminates the entire class of floating-point arithmetic bugs (₹69.9999).
 */
import { z } from 'zod';

// ─── Money ──────────────────────────────────────────────────────────────────

/** Always integer paise. Never float rupees. */
export const MoneyPaise = z.number().int().min(0);

/** Convert paise to display string. Pure function, unit-tested with 40 cases. */
export function formatPaise(paise: number, currencySymbol = '₹'): string {
  const rupees = paise / 100;
  return `${currencySymbol}${rupees.toFixed(2).replace(/\.00$/, '')}`;
}

/** Convert rupee input (possibly float) to integer paise. Rounds to nearest paise. */
export function parsePaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// ─── Identifiers ────────────────────────────────────────────────────────────

/** URL-safe slug: lowercase alphanumeric + hyphens only. Used as stable IDs in URLs. */
export const Slug = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .max(60);

/** UUID v4 string. Used for all entity IDs. */
export const UUID = z.string().uuid();

// ─── Media ──────────────────────────────────────────────────────────────────

/**
 * Provider-agnostic media asset.
 * Stores URL + optional dimensions + alt text + version tag.
 * Decoupled from any specific CDN — works with jsDelivr, Cloudinary, or any URL.
 */
export const MediaAssetSchema = z.object({
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().max(120).optional(),
  mediaVersion: z.string().max(20).optional(), // e.g. "v1.2"
});

/**
 * Build a jsDelivr CDN URL for a GitHub-hosted asset.
 * Uses tagged versions for cache-friendly immutable URLs.
 *
 * @example jsdelivrUrl('omkara-brand/omkara-assets-products', 'products/sprouts.webp', 'v1.0')
 * // => 'https://cdn.jsdelivr.net/gh/omkara-brand/omkara-assets-products@v1.0/products/sprouts.webp'
 */
export function jsdelivrUrl(repo: string, path: string, version = 'latest'): string {
  return `https://cdn.jsdelivr.net/gh/${repo}@${version}/${path}`;
}

/** YouTube video ID — exactly 11 characters. */
export const YouTubeId = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{11}$/, 'Must be a valid 11-character YouTube video ID');

// ─── Visual ─────────────────────────────────────────────────────────────────

/** 6-digit hex color code with # prefix. */
export const HexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g., #FF5733)');

/** Focal point for responsive image cropping: x,y as percentage 0–100. */
export const FocalPoint = z.object({
  x: z.number().min(0).max(100).default(50),
  y: z.number().min(0).max(100).default(50),
});

// ─── WhatsApp Template Tokens ───────────────────────────────────────────────

/** Allowed tokens in WhatsApp templates. No eval, no injection surface. */
export const WHATSAPP_TOKENS = [
  '{{items}}',
  '{{total}}',
  '{{subtotal}}',
  '{{orderNote}}',
  '{{businessName}}',
] as const;

export type WhatsAppToken = (typeof WHATSAPP_TOKENS)[number];

/**
 * Validates a tokenized string:
 * - Any {{...}} pattern must be one of the whitelisted tokens
 * - Rejects unknown tokens like {{evil}} or {{constructor}}
 */
export const TokenizedString = z.string().refine(
  (val) => {
    const tokenPattern = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = tokenPattern.exec(val)) !== null) {
      const token = `{{${match[1]}}}`;
      if (!WHATSAPP_TOKENS.includes(token as WhatsAppToken)) {
        return false;
      }
    }
    return true;
  },
  {
    message: `Only whitelisted tokens allowed: ${WHATSAPP_TOKENS.join(', ')}`,
  },
);

// ─── Enums ──────────────────────────────────────────────────────────────────

export const ProductStatus = z.enum([
  'AVAILABLE',
  'FRESHLY_PREPARED',
  'LOW_AVAILABILITY',
  'SOLD_OUT',
  'COMING_SOON',
  'HIDDEN',
]);
export type ProductStatus = z.infer<typeof ProductStatus>;

export const NavIcon = z.enum([
  'HOME',
  'MENU',
  'WHATSAPP',
  'CALL',
  'INSTAGRAM',
  'YOUTUBE',
  'FACEBOOK',
  'EMAIL',
]);
export type NavIcon = z.infer<typeof NavIcon>;

export const LayoutStyle = z.enum(['rail', 'grid']);
export type LayoutStyle = z.infer<typeof LayoutStyle>;

export const BorderRadius = z.enum(['none', 'sm', 'md', 'lg']);
export type BorderRadius = z.infer<typeof BorderRadius>;

/**
 * Maps border radius enum to actual pixel values.
 * This mapping is system-locked — admin picks from the enum, never raw px.
 */
export const BORDER_RADIUS_MAP: Record<z.infer<typeof BorderRadius>, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
};

// ─── Tag Emoji Set (closed — no arbitrary images) ───────────────────────────

export const TAG_ICONS = ['🌿', '🌱', '🔥', '⭐', '🆕', '⏳', '💪', '🥜'] as const;
export type TagIcon = (typeof TAG_ICONS)[number];

// ─── Type Exports ───────────────────────────────────────────────────────────

export type MoneyPaise = z.infer<typeof MoneyPaise>;
export type Slug = z.infer<typeof Slug>;
export type FocalPoint = z.infer<typeof FocalPoint>;
export type HexColor = z.infer<typeof HexColor>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
