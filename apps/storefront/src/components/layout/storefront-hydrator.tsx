'use client';

import { useEffect } from 'react';
import { getCachedManifest } from '@/lib/manifest-cache';

export function StorefrontHydrator() {
  useEffect(() => {
    // Pre-fetch and cache the manifest in the background on page load
    // so that client-side components (like Cart) have instant access
    getCachedManifest().catch(console.error);
  }, []);

  return null;
}
