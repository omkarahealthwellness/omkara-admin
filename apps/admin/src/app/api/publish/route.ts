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

    const settingsData = settingsSnap.exists() ? settingsSnap.data() : {};

    const assembledManifest = {
      version: 1, // Will be incremented or managed via pointer
      lastUpdated: new Date().toISOString(),
      storeSettings: settingsData.storeSettings || {
        storeName: 'Omkara',
        currency: 'INR',
        supportEmail: 'support@omkara.com',
        supportPhone: '+919876543210',
      },
      navigation: settingsData.navigation || [],
      hero: settingsData.hero || {
        headline: 'Premium Wellness',
        subheadline: 'Rooted in Bikaner',
        ctaText: 'Shop Now',
        ctaLink: '/products',
      },
      whatsappTemplates: settingsData.whatsappTemplates || {
        orderConfirmation: 'Order confirmed',
        shippingUpdate: 'Shipping updated',
        abandonedCart: 'Cart abandoned',
      },
      uiConfig: settingsData.uiConfig || {
        theme: 'light',
        primaryColor: '#E25822',
      },
      categories: categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      tags: tagsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      products: productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    // 3. Validation Wall (Phase 3.2)
    const validated = ManifestSchema.parse(assembledManifest);

    // 4. Size Budget Enforcer (Phase 3.3)
    const serialized = JSON.stringify(validated);
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

    // 5. Hash & Upload to KV (Phase 3.4)
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    const versionId = `v_${Date.now()}_${hashHex.substring(0, 8)}`;

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
          hash: hashHex,
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
      hash: hashHex,
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
