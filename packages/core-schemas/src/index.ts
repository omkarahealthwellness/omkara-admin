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
} from './primitives';
export type { TagIcon, WhatsAppToken, MediaAsset } from './primitives';

// Product schemas
export { VariantSchema, AddonSchema, ProductSchema } from './product';
export type { Variant, Addon, Product } from './product';

// Category schema
export { CategorySchema } from './category';
export type { Category } from './category';

// Tag schema
export { TagSchema } from './tag';
export type { Tag } from './tag';

// Store schemas
export {
  StoreSettingsSchema,
  NavigationItemSchema,
  HeroSchema,
  WhatsAppTemplatesSchema,
  UIConfigSchema,
} from './store';
export type { StoreSettings, NavigationItem, Hero, WhatsAppTemplates, UIConfig } from './store';

// Manifest schema
export {
  ManifestSchema,
  ManifestSchemaLoose,
  LatestPointerSchema,
  CURRENT_MANIFEST_VERSION,
  MAX_MANIFEST_SIZE_BYTES,
} from './manifest';
export type { Manifest, LatestPointer } from './manifest';

// Cart schemas & logic
export {
  CartLineSchema,
  CartStateSchema,
  hashLine,
  lineTotal,
  cartTotal,
  CART_STORAGE_KEY,
  CART_EXPIRY_MS,
} from './cart';
export type { CartLine, CartState } from './cart';

// WhatsApp serializer
export {
  serializeWhatsAppMessage,
  buildWhatsAppUrl,
  WA_MESSAGE_WARN_LENGTH,
  WA_MESSAGE_MAX_LENGTH,
} from './whatsapp';
export type { WhatsAppSerializerInput } from './whatsapp';
