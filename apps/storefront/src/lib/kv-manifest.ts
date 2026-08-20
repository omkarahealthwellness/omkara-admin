import { getOptionalRequestContext } from '@cloudflare/next-on-pages';
import { Manifest, ManifestSchemaLoose } from '@omkara/core-schemas';

export async function getManifest(): Promise<Manifest | null> {
  try {
    const ctx = getOptionalRequestContext();
    const env = ctx?.env as any;
    if (!env || !env.MANIFEST_KV) {
      return null;
    }

    const data = await env.MANIFEST_KV.get('manifest_LATEST.json');
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);
    const result = ManifestSchemaLoose.safeParse(parsed);

    if (!result.success) {
      return parsed as Manifest;
    }

    return result.data as Manifest;
  } catch (error) {
    console.error('Failed to load manifest from KV:', error);
    return null;
  }
}

export async function getManifestHash(): Promise<string | null> {
  try {
    const ctx = getOptionalRequestContext();
    const env = ctx?.env as any;
    if (!env || !env.MANIFEST_KV) return null;

    const data = await env.MANIFEST_KV.get('manifest_LATEST.json');
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.contentHash || parsed.publishedAt || null;
  } catch (error) {
    console.error('Failed to load manifest hash from KV:', error);
    return null;
  }
}
