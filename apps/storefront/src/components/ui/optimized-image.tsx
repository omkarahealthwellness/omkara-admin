/**
 * OptimizedImage — renders a <picture> element with AVIF/WebP sources
 * and responsive mobile variants for jsDelivr-hosted assets.
 *
 * For non-jsDelivr URLs, falls back to a standard <img> with lazy loading.
 * Prevents CLS by requiring explicit width/height.
 */
import { toAvif, toWebp, toMobile, isJsDelivrUrl } from "@/lib/image-utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Use fetchpriority="high" for above-the-fold images (hero, first product) */
  priority?: boolean;
  /** Responsive sizes attribute */
  sizes?: string;
  className?: string;
  /** CSS object-fit style */
  objectFit?: "cover" | "contain" | "fill" | "none";
  /** CSS object-position */
  objectPosition?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  className,
  objectFit = "cover",
  objectPosition,
}: OptimizedImageProps) {
  const isCdn = isJsDelivrUrl(src);

  // For CDN images, generate optimized variants
  if (isCdn) {
    const avifDesktop = toAvif(src);
    const webpDesktop = toWebp(src);
    const avifMobile = avifDesktop ? toMobile(avifDesktop) : null;
    const webpMobile = webpDesktop ? toMobile(webpDesktop) : null;

    return (
      <picture>
        {/* Mobile AVIF (small screens) */}
        {avifMobile && (
          <source
            media="(max-width: 768px)"
            srcSet={avifMobile}
            type="image/avif"
          />
        )}
        {/* Mobile WebP fallback */}
        {webpMobile && (
          <source
            media="(max-width: 768px)"
            srcSet={webpMobile}
            type="image/webp"
          />
        )}
        {/* Desktop AVIF */}
        {avifDesktop && (
          <source srcSet={avifDesktop} type="image/avif" />
        )}
        {/* Desktop WebP */}
        {webpDesktop && (
          <source srcSet={webpDesktop} type="image/webp" />
        )}
        {/* Fallback img — always rendered */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          className={className}
          style={{
            objectFit,
            ...(objectPosition ? { objectPosition } : {}),
          }}
        />
      </picture>
    );
  }

  // Non-CDN fallback — standard img with lazy loading
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      sizes={sizes}
      className={className}
      style={{
        objectFit,
        ...(objectPosition ? { objectPosition } : {}),
      }}
    />
  );
}
