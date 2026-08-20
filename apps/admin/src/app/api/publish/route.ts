import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { KVNamespace } from '@cloudflare/workers-types';
import { ManifestSchema } from '@omkara/core-schemas';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface CloudflareEnv {
  MANIFEST_KV: KVNamespace;
}

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    // Check Authorization header for Bearer token
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('x-api-key');

    // MOSSAD-LEVEL SECURITY: Require strictly defined API Key for edge compilation
    const expectedApiKey = process.env.PUBLISH_API_KEY;
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      console.warn('Blocked unauthorized publish attempt');
      return NextResponse.json({ error: 'Unauthorized Edge Publishing Attempt' }, { status: 401 });
    }

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Bearer Token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    // 2. Draft Assembler (Phase 3.1)
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    // Fetch collections
    const [productsSnap, categoriesSnap, tagsSnap, settingsSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'tags')),
      getDoc(doc(db, 'settings', 'store')),
    ]);

    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {} as any;

    // Assemble categories, tags, products from Firestore
    const categories = categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const tags = tagsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const products = productsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.status !== 'HIDDEN');

    // Compute content hash BEFORE adding it to the manifest
    const contentForHash = JSON.stringify({ categories, tags, products });
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(contentForHash));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Build manifest matching ManifestSchema EXACTLY
    const assembledManifest = {
      manifestVersion: 1,
      contentHash,
      publishedAt: new Date().toISOString(),
      store: settingsData.store || {
        businessName: 'Omkara',
        logo: { url: '/logo.svg' },
        phone: '+918560078208',
        email: 'omkara.health.wellness@gmail.com',
        social: {},
        whatsappNumber: '+918560078208',
      },
      navigation: settingsData.navigation || [],
      hero: settingsData.hero || {
        focal: { x: 50, y: 50 },
        visible: true,
        overlayOpacity: 40,
      },
      categories,
      products,
      tags,
      whatsapp: settingsData.whatsapp || {
        number: '+918560078208',
        templates: {
          greeting: 'Hi {{businessName}}!',
          order: 'Order: {{items}} Total: {{total}}',
          footer: 'Thank you!',
        },
      },
      ui: settingsData.ui || {
        primaryColor: '#E25822',
        borderRadius: 'md',
      },
    };

    // 3. Validation Wall — use safeParse to get useful error messages
    const validationResult = ManifestSchema.safeParse(assembledManifest);
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

    // 4. Size Budget Enforcer (Phase 3.3)
    const serialized = JSON.stringify(manifestToPublish);
    const sizeInBytes = new Blob([serialized]).size;
    const MAX_SIZE = 300 * 1024; // 300KB

    if (sizeInBytes > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `Manifest size (${(sizeInBytes / 1024).toFixed(2)}KB) exceeds 300KB limit.`,
        },
        { status: 413 },
      );
    }

    // 5. Version ID for KV storage
    const versionId = `v_${Date.now()}_${contentHash.substring(0, 8)}`;

    let kvSuccess = false;

    // Check if we are running in the Cloudflare context
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
      console.warn('Could not access KV. Running locally? Missing getRequestContext binding.', e);
    }

    return NextResponse.json({
      success: true,
      version: versionId,
      sizeKB: +(sizeInBytes / 1024).toFixed(2),
      hash: contentHash,
      kvUploaded: kvSuccess,
      message: kvSuccess
        ? 'Published to KV successfully!'
        : 'Manifest assembled, but KV upload skipped (local mode).',
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
