'use client';

import { Manifest } from '@omkara/core-schemas';
import { fetchManifestAction, fetchManifestHashAction } from './manifest-actions';

const CACHE_KEY = 'omkara_manifest_cache';

interface CacheEntry {
  data: Manifest;
  cachedAt: string;
  contentHash: string;
}

export async function getCachedManifest(): Promise<Manifest | null> {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Fetch server hash (tiny read)
    const serverHash = await fetchManifestHashAction();
    if (!serverHash) return null;

    // 2. Check local storage
    const cachedItem = localStorage.getItem(CACHE_KEY);
    if (cachedItem) {
      const entry: CacheEntry = JSON.parse(cachedItem);
      // 3. Compare hashes
      if (entry.contentHash === serverHash) {
        return entry.data; // Cache hit (instant)
      }
    }

    // 4. Mismatch or miss: fetch full manifest
    const fullManifest = await fetchManifestAction();
    if (fullManifest) {
      const newEntry: CacheEntry = {
        data: fullManifest,
        contentHash: serverHash,
        cachedAt: new Date().toISOString(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(newEntry));
      return fullManifest;
    }
    return null;
  } catch (error) {
    console.error('Browser cache error:', error);
    return null;
  }
}
