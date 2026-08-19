/**
 * Image URL utility functions for the responsive image pipeline.
 * Handles format conversion (AVIF/WebP) and mobile variant derivation
 * for jsDelivr-hosted assets.
 */

/**
 * Check if a URL is from jsDelivr CDN (GitHub-hosted assets).
 * Format swapping is only applied to CDN-hosted assets.
 */
export function isJsDelivrUrl(url: string): boolean {
  return url.includes('cdn.jsdelivr.net');
}

/**
 * Swap file extension to .avif.
 * Only applies to jsDelivr URLs — external URLs are returned as-is.
 */
export function toAvif(url: string): string | null {
  if (!isJsDelivrUrl(url)) return null;
  return url.replace(/\.(webp|jpe?g|png)$/i, '.avif');
}

/**
 * Swap file extension to .webp.
 * Only applies to jsDelivr URLs — external URLs are returned as-is.
 */
export function toWebp(url: string): string | null {
  if (!isJsDelivrUrl(url)) return null;
  return url.replace(/\.(avif|jpe?g|png)$/i, '.webp');
}

/**
 * Insert '-mobile' suffix before the file extension.
 * e.g. 'hero.webp' → 'hero-mobile.webp'
 * Only applies to jsDelivr URLs.
 */
export function toMobile(url: string): string | null {
  if (!isJsDelivrUrl(url)) return null;
  return url.replace(/(\.[a-z]+)$/i, '-mobile$1');
}

/**
 * Get the file format from a URL.
 */
export function getFormat(url: string): string | null {
  const match = url.match(/\.([a-z]+)$/i);
  return match ? match[1].toLowerCase() : null;
}
