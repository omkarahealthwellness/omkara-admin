/**
 * Tag schema — admin-defined labels for products.
 * Constrained: ≤12 tags total, ≤2 displayed per card (UI rule).
 * Icons are from a closed emoji set — zero image weight.
 */
import { z } from 'zod';
import { UUID, HexColor } from './primitives.js';

export const TagSchema = z
  .object({
    id: UUID, // [locked]
    name: z.string().min(1).max(20), // [content]
    icon: z.string().max(2), // [content] — emoji from closed set (enforced in admin UI)
    color: HexColor, // [config] — from palette
    sortOrder: z.number().int().min(0), // [config]
  })
  .strict();

export type Tag = z.infer<typeof TagSchema>;
