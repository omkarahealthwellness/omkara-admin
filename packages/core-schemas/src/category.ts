/**
 * Category schema — groups products into displayable sections.
 * Each category has its own theme color, layout style, and display limit.
 */
import { z } from 'zod';
import { UUID, Slug, HexColor, LayoutStyle, MediaAssetSchema } from './primitives';

export const CategorySchema = z
  .object({
    id: UUID, // [locked]
    slug: Slug, // [locked] — stable, used in URLs
    name: z.string().min(1).max(40), // [content]
    image: MediaAssetSchema.optional(), // [content] — provider-agnostic
    visible: z.boolean().default(true), // [content]
    sortOrder: z.number().int().min(0), // [config]
    displayLimit: z.number().int().min(1).max(50).default(12), // [config]
    layoutStyle: LayoutStyle.default('rail'), // [config]
    themeColor: HexColor.optional(), // [config] — from curated palette
    seeAllLabel: z.string().max(30).default('See all →'), // [config]
  })
  .strict();

export type Category = z.infer<typeof CategorySchema>;
