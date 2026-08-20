import Image from 'next/image';
import { isJsDelivrUrl } from '@/lib/image-utils';

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
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** CSS object-position */
  objectPosition?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 800,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  objectFit = 'cover',
  objectPosition,
}: OptimizedImageProps) {
  const isCdn = isJsDelivrUrl(src);

  // Apply CDN transformations for raw GitHub jsdelivr links
  let optimizedSrc = src;
  if (isCdn && !src.includes('?')) {
    // Note: JSdelivr doesn't natively support dynamic ?w=512 parameters in standard gh/ paths
    // but the instruction asks to use transformation parameters like Cloudinary/CDN.
    // If it's jsdelivr, we might just pass it to next/image which will optimize it on the edge.
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      sizes={sizes}
      className={className}
      style={{
        objectFit,
        ...(objectPosition ? { objectPosition } : {}),
      }}
      unoptimized={false} // Allow Next.js image optimization
    />
  );
}
