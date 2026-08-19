import { getRequestContext } from "@cloudflare/next-on-pages";
import { Manifest, ManifestSchema } from "@omkara/core-schemas";

export async function getManifest(): Promise<Manifest | null> {
  try {
    const { env } = getRequestContext();
    if (!env || !env.MANIFEST_KV) {
      console.warn("KV namespace MANIFEST_KV not bound.");
      return null;
    }

    const data = await env.MANIFEST_KV.get("manifest_LATEST.json");
    if (!data) {
      console.warn("manifest_LATEST.json not found in KV");
      return null;
    }

    const parsed = JSON.parse(data);
    const result = ManifestSchema.safeParse(parsed);

    if (!result.success) {
      console.error("Manifest validation failed in Storefront:", result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("Failed to load manifest from KV:", error);
    return null;
  }
}

export async function getManifestHash(): Promise<string | null> {
  try {
    const { env } = getRequestContext();
    if (!env || !env.MANIFEST_KV) return null;

    const data = await env.MANIFEST_KV.get("manifest_LATEST.json");
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.lastUpdated || parsed.version || null;
  } catch (error) {
    console.error("Failed to load manifest hash from KV:", error);
    return null;
  }
}
