/**
 * Store settings, navigation, hero, WhatsApp templates, and UI config schemas.
 * These define the "chrome" of the site — everything not product-specific.
 */
import { z } from 'zod';
import { HexColor, FocalPoint, BorderRadius, NavIcon, TokenizedString, MediaAssetSchema } from './primitives';

// ─── Store Settings ─────────────────────────────────────────────────────────

export const StoreSettingsSchema = z
  .object({
    id: z.literal('main'), // [locked] singleton document
    businessName: z.string().min(1).max(40), // [content]
    logo: MediaAssetSchema, // [content] — provider-agnostic (jsDelivr, Cloudinary, etc.)
    tagline: z.string().max(60).optional(), // [content]
    phone: z.string().min(6).max(20), // [content]
    email: z.string().email().optional(), // [content]
    address: z.string().max(200).optional(), // [content]
    social: z.object({
      instagram: z.string().url().optional(),
      youtube: z.string().url().optional(),
      facebook: z.string().url().optional(),
    }), // [content]
    whatsappNumber: z.string().regex(/^\+\d{10,15}$/, 'Must be E.164 format (e.g., +919876543210)'), // [config]
  })
  .strict();

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

// ─── Navigation ─────────────────────────────────────────────────────────────

export const NavigationItemSchema = z
  .object({
    id: z.string().uuid(), // [locked]
    label: z.string().min(1).max(30), // [content]
    icon: NavIcon, // [config] — from closed icon set
    url: z
      .string()
      .refine((val) => /^(https?:\/\/|tel:|mailto:)/.test(val), {
        message: 'URL must start with https://, http://, tel:, or mailto:',
      }), // [content] — protocol-whitelisted (blocks javascript: injection)
    visible: z.boolean().default(true), // [content]
    sortOrder: z.number().int().min(0), // [config]
  })
  .strict();

export type NavigationItem = z.infer<typeof NavigationItemSchema>;

// ─── Hero ───────────────────────────────────────────────────────────────────

export const HeroSchema = z
  .object({
    image: MediaAssetSchema.optional(), // [content] — provider-agnostic
    focal: FocalPoint, // [content]
    heading: z.string().max(60).optional(), // [content]
    subheading: z.string().max(120).optional(), // [content]
    overlayOpacity: z.number().min(0).max(80).default(40), // [config] — 0–80%, clamped
    visible: z.boolean().default(true), // [content]
  })
  .strict();

export type Hero = z.infer<typeof HeroSchema>;

// ─── WhatsApp Templates ─────────────────────────────────────────────────────

export const WhatsAppTemplatesSchema = z
  .object({
    greeting: TokenizedString.pipe(z.string().max(200)), // [config]
    order: TokenizedString.pipe(z.string().max(1000)), // [config] — must reference {{items}} and {{total}}
    footer: TokenizedString.pipe(z.string().max(200)), // [config]
  })
  .strict();

export type WhatsAppTemplates = z.infer<typeof WhatsAppTemplatesSchema>;

// ─── UI Configuration ───────────────────────────────────────────────────────

export const UIConfigSchema = z
  .object({
    primaryColor: HexColor, // [config]
    accentColor: HexColor.optional(), // [config]
    borderRadius: BorderRadius.default('md'), // [config] — maps to 0/4/8/16px
  })
  .strict();

export type UIConfig = z.infer<typeof UIConfigSchema>;
