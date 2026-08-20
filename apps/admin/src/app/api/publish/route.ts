import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { KVNamespace } from '@cloudflare/workers-types';
import { ManifestSchema, MAX_MANIFEST_SIZE_BYTES } from '@omkara/core-schemas';

interface CloudflareEnv {
  MANIFEST_KV: KVNamespace;
}

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Bearer Token' }, { status: 401 });
    }

    const body = (await req.json()) as { manifest?: unknown };
    const manifest = body?.manifest;

    if (!manifest) {
      return NextResponse.json({ error: 'Missing manifest payload in request' }, { status: 400 });
    }

    // 2. Validation Wall — Strict schema verification at the edge
    const validationResult = ManifestSchema.safeParse(manifest);
    if (!validationResult.success) {
      console.error('Manifest validation failed:', validationResult.error.flatten());
      return NextResponse.json(
        {
          error: 'Manifest validation failed',
          details: validationResult.error.flatten(),
        },
        { status: 400 },
      );
    }
    const manifestToPublish = validationResult.data;

    // 3. Size Budget Enforcer (Phase 3.3 — 300KB limit)
    const serialized = JSON.stringify(manifestToPublish);
    const sizeInBytes = new Blob([serialized]).size;

    if (sizeInBytes > MAX_MANIFEST_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Manifest size (${(sizeInBytes / 1024).toFixed(2)}KB) exceeds 300KB limit.`,
        },
        { status: 413 },
      );
    }

    // 4. Version ID for KV storage
    const contentHash = manifestToPublish.contentHash || 'published';
    const versionId = `v_${Date.now()}_${contentHash.substring(0, 8)}`;

    let kvSuccess = false;

    // 5. Cloudflare KV Write
    try {
      const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
      if (env && env.MANIFEST_KV) {
        await env.MANIFEST_KV.put(`manifest_${versionId}.json`, serialized);
        await env.MANIFEST_KV.put(`manifest_LATEST.json`, serialized);

        // Audit trail (Phase 3.8)
        const logEntry = JSON.stringify({
          timestamp: new Date().toISOString(),
          version: versionId,
          user: 'admin',
          hash: contentHash,
        });
        await env.MANIFEST_KV.put(`audit_log_${versionId}`, logEntry);

        kvSuccess = true;
      }
    } catch (e) {
      console.warn('Could not access KV binding.', e);
    }

    return NextResponse.json({
      success: true,
      version: versionId,
      sizeKB: +(sizeInBytes / 1024).toFixed(2),
      hash: contentHash,
      kvUploaded: kvSuccess,
      message: kvSuccess
        ? 'Published to KV successfully!'
        : 'Manifest assembled, but KV upload skipped (local mode or missing KV binding).',
    });
  } catch (error) {
    console.error('Publishing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to publish manifest',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
