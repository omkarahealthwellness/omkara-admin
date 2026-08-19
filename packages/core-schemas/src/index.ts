/**
 * @omkara/core-schemas — barrel export
 *
 * THE SINGLE SOURCE OF TRUTH for all data shapes in the system.
 * Imported by: admin app, publish function, storefront, test utils.
 */

// Primitives & Enums
export {
  MoneyPaise,
  Slug,
  UUID,
  MediaAssetSchema,
  YouTubeId,
  HexColor,
  FocalPoint,
  ProductStatus,
  NavIcon,
  LayoutStyle,
  BorderRadius,
  BORDER_RADIUS_MAP,
  TAG_ICONS,
  WHATSAPP_TOKENS,
  TokenizedString,
  formatPaise,
  parsePaise,
  jsdelivrUrl,
} from './primitives.js';
export type { TagIcon, WhatsAppToken, MediaAsset } from './primitives.js';

// Product schemas
export { VariantSchema, AddonSchema, ProductSchema } from './product.js';
export type { Variant, Addon, Product } from './product.js';

// Category schema
export { CategorySchema } from './category.js';
export type { Category } from './category.js';

// Tag schema
export { TagSchema } from './tag.js';
export type { Tag } from './tag.js';

// Store schemas
export {
  StoreSettingsSchema,
  NavigationItemSchema,
  HeroSchema,
  WhatsAppTemplatesSchema,
  UIConfigSchema,
} from './store.js';
export type {
  StoreSettings,
  NavigationItem,
  Hero,
  WhatsAppTemplates,
  UIConfig,
} from './store.js';

// Manifest schema
export {
  ManifestSchema,
  ManifestSchemaLoose,
  LatestPointerSchema,
  CURRENT_MANIFEST_VERSION,
  MAX_MANIFEST_SIZE_BYTES,
} from './manifest.js';
export type { Manifest, LatestPointer } from './manifest.js';

// Cart schemas & logic
export {
  CartLineSchema,
  CartStateSchema,
  hashLine,
  lineTotal,
  cartTotal,
  CART_STORAGE_KEY,
  CART_EXPIRY_MS,
} from './cart.js';
export type { CartLine, CartState } from './cart.js';

// WhatsApp serializer
export {
  serializeWhatsAppMessage,
  buildWhatsAppUrl,
  WA_MESSAGE_WARN_LENGTH,
  WA_MESSAGE_MAX_LENGTH,
} from './whatsapp.js';
export type { WhatsAppSerializerInput } from './whatsapp.js';
