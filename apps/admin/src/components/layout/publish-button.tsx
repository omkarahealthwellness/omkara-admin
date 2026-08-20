'use client';

import { CloudUpload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';

export function PublishButton() {
  const publishMutation = useMutation({
    mutationFn: async () => {
      // 1. Fetch collections directly from Firestore in the browser
      const [productsSnap, categoriesSnap, tagsSnap, settingsSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'tags')),
        getDoc(doc(db, 'settings', 'store')),
      ]);

      const settingsData = settingsSnap.exists() ? (settingsSnap.data() as any) : {};
      const storeSettings = settingsData.storeSettings || settingsData.store || {};

      // Assemble categories, tags, products from Firestore
      const categories = categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const tags = tagsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const products = productsSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p: any) => p.status !== 'HIDDEN');

      // Compute content hash
      const contentForHash = JSON.stringify({ categories, tags, products });
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(contentForHash));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // Build manifest matching ManifestSchema exactly
      const manifest = {
        manifestVersion: 1,
        contentHash,
        publishedAt: new Date().toISOString(),
        store: {
          businessName: storeSettings.businessName || 'Omkara',
          logo: storeSettings.logo?.url ? storeSettings.logo : { url: '/logo.svg' },
          tagline: storeSettings.tagline || '',
          phone: storeSettings.phone || '+918560078208',
          email: storeSettings.email || 'omkara.health.wellness@gmail.com',
          social: storeSettings.social || {},
          whatsappNumber: storeSettings.whatsappNumber || '+918560078208',
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
          number: storeSettings.whatsappNumber || '+918560078208',
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

      // Get current Firebase Auth token
      const idToken = (await auth.currentUser?.getIdToken()) || 'authenticated_session';

      // POST to Edge Publish API
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ manifest }),
      });

      const data = (await res.json()) as {
        error?: string;
        details?: any;
        message?: string;
        version?: string;
        sizeKB?: number;
      };

      if (!res.ok) {
        if (data.details) {
          throw new Error(`${data.error}: ${JSON.stringify(data.details, null, 2)}`);
        }
        throw new Error(data.error || 'Failed to publish');
      }

      return data;
    },
    onSuccess: (data) => {
      alert(`✅ ${data.message}\nVersion: ${data.version}\nSize: ${data.sizeKB}KB`);
    },
    onError: (error) => {
      alert(`❌ Publishing Failed: ${error.message}`);
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      className="hidden sm:flex gap-2 border-primary/20 hover:bg-primary/5"
      onClick={() => publishMutation.mutate()}
      disabled={publishMutation.isPending}
    >
      {publishMutation.isPending ? (
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      ) : (
        <CloudUpload className="h-4 w-4 text-primary" />
      )}
      <span className="text-primary font-medium">
        {publishMutation.isPending ? 'Publishing...' : 'Publish Changes'}
      </span>
    </Button>
  );
}
