/**
 * Cart schemas — client-side only, never touches Firestore.
 *
 * Key design decision (Conflict #5 resolution):
 * lineId = hash(productId, variantId, sortedAddonIds)
 * The NOTE is explicitly EXCLUDED from the hash.
 * Reason: "Mixed Sprouts, Medium" with and without a note should stack as one line
 * with incrementing quantity, not become two separate lines.
 */
import { z } from 'zod';
import { MoneyPaise } from './primitives.js';

// ─── Cart Line ──────────────────────────────────────────────────────────────

export const CartLineSchema = z.object({
  lineId: z.string(), // = hashLine(productId, variantId, sortedAddonIds)
  productId: z.string(),
  productName: z.string(), // snapshotted at add-time for display
  variantId: z.string(),
  variantName: z.string(),
  addonIds: z.array(z.string()), // sorted ascending — part of lineId hash
  addonNames: z.array(z.string()),
  note: z.string(), // NOT part of lineId — see doc above
  quantity: z.number().int().positive(),
  unitPrice: MoneyPaise, // snapshotted at add-time; revalidated on cart open
  addedAt: z.string().datetime(),
});

export type CartLine = z.infer<typeof CartLineSchema>;

// ─── Cart State ─────────────────────────────────────────────────────────────

export const CartStateSchema = z.object({
  cartVersion: z.literal(1), // bump when CartLine shape changes → triggers migration
  currency: z.literal('INR'),
  lines: z.array(CartLineSchema),
  orderNote: z.string(),
  lastTouchedAt: z.string().datetime(), // drives 48h inactivity expiry
});

export type CartState = z.infer<typeof CartStateSchema>;

// ─── Cart Hashing ───────────────────────────────────────────────────────────

/**
 * Compute a deterministic line identity from product configuration.
 * Note is EXCLUDED — same product+variant+addons = same line regardless of note.
 *
 * Uses a simple string hash (djb2) rather than sha256 for performance —
 * this is a cart dedup key, not a security hash.
 */
export function hashLine(productId: string, variantId: string, addonIds: string[]): string {
  const sorted = [...addonIds].sort();
  const input = `${productId}|${variantId}|${sorted.join(',')}`;
  return djb2Hash(input);
}

/** djb2 hash → 8-char hex string. Fast, deterministic, good distribution. */
function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ─── Cart Constants ─────────────────────────────────────────────────────────

/** localStorage key for cart persistence. */
export const CART_STORAGE_KEY = 'cart_v1';

/** Cart inactivity expiry in milliseconds (48 hours). */
export const CART_EXPIRY_MS = 48 * 60 * 60 * 1000;

// ─── Cart Math (integer paise — no floats) ──────────────────────────────────

/** Calculate line total: (variant price + sum of addon prices) × quantity. All in paise. */
export function lineTotal(unitPrice: number, addonPrices: number[], quantity: number): number {
  const addonSum = addonPrices.reduce((sum, p) => sum + p, 0);
  return (unitPrice + addonSum) * quantity;
}

/** Calculate cart total: sum of all line totals. All in paise. */
export function cartTotal(lines: CartLine[]): number {
  // Note: this uses unitPrice which is already variant+addons snapshotted at add-time
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
