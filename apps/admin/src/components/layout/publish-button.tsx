'use client';

import { CloudUpload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';

export function PublishButton() {
  const publishMutation = useMutation({
    mutationFn: async () => {
      // 1. Verify user is authenticated
      if (!auth.currentUser) {
        throw new Error('You must be signed in to publish. Please log in at /login.');
      }

      // 2. Safe fetch for products
      let products: any[] = [];
      try {
        const snap = await getDocs(collection(db, 'products'));
        products = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p: any) => p.status !== 'HIDDEN');
      } catch (e) {
        console.warn('Could not read products collection, using empty list', e);
      }

      // 3. Safe fetch for categories
      let categories: any[] = [];
      try {
        const snap = await getDocs(collection(db, 'categories'));
        categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn('Could not read categories collection, using empty list', e);
      }

      // 4. Safe fetch for tags
      let tags: any[] = [];
      try {
        const snap = await getDocs(collection(db, 'tags'));
        tags = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn('Could not read tags collection, using empty list', e);
      }

      // 5. Safe fetch for store settings
      let storeSettings: any = {};
      try {
        const snap = await getDoc(doc(db, 'settings', 'store'));
        if (snap.exists()) {
          const data = snap.data() as any;
          storeSettings = data.storeSettings || data.store || data || {};
        }
      } catch (e) {
        console.warn('Could not read store settings, using defaults', e);
      }

      // 6. Safe fetch for hero settings
      let heroSettings: any = {};
      try {
        const snap = await getDoc(doc(db, 'settings', 'hero'));
        if (snap.exists()) {
          heroSettings = snap.data() as any;
        }
      } catch (e) {
        console.warn('Could not read hero settings', e);
      }

      // 7. Safe fetch for ui settings
      let uiSettings: any = {};
      try {
        const snap = await getDoc(doc(db, 'settings', 'ui_config'));
        if (snap.exists()) {
          uiSettings = snap.data() as any;
        }
      } catch (e) {
        console.warn('Could not read ui settings', e);
      }

      // 8. Safe fetch for whatsapp settings
      let whatsappSettings: any = {};
      try {
        const snap = await getDoc(doc(db, 'settings', 'whatsapp'));
        if (snap.exists()) {
          whatsappSettings = snap.data() as any;
        }
      } catch (e) {
        console.warn('Could not read whatsapp settings', e);
      }

      // 9. Safe fetch for navigation settings
      let navigationSettings: any[] = [];
      try {
        const snap = await getDoc(doc(db, 'settings', 'navigation'));
        if (snap.exists()) {
          navigationSettings = (snap.data() as any)?.items || [];
        }
      } catch (e) {
        console.warn('Could not read navigation settings', e);
      }

      // 10. Compute content hash
      const contentForHash = JSON.stringify({ categories, tags, products });
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(contentForHash));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // 11. Assemble full manifest matching ManifestSchema exactly
      const manifest = {
        manifestVersion: 1,
        contentHash,
        publishedAt: new Date().toISOString(),
        store: {
          businessName: storeSettings.businessName || 'Omkara',
          logo: storeSettings.logo?.url ? storeSettings.logo : { url: '/logo.svg' },
          tagline: storeSettings.tagline || 'Natural Wellness from Bikaner',
          phone: storeSettings.phone || '+918560078208',
          email: storeSettings.email || 'omkara.health.wellness@gmail.com',
          address: storeSettings.address || 'Bikaner, Rajasthan, India',
          social: {
            instagram: storeSettings.social?.instagram || undefined,
            youtube: storeSettings.social?.youtube || undefined,
            facebook: storeSettings.social?.facebook || undefined,
          },
          whatsappNumber: storeSettings.whatsappNumber || '+918560078208',
        },
        navigation: navigationSettings,
        hero: {
          image: heroSettings.image?.url ? heroSettings.image : undefined,
          focal: heroSettings.focal || { x: 50, y: 50 },
          heading: heroSettings.heading || 'Welcome to Omkara',
          subheading: heroSettings.subheading || 'Premium Quality Products',
          overlayOpacity: typeof heroSettings.overlayOpacity === 'number' ? heroSettings.overlayOpacity : 40,
          visible: heroSettings.visible !== false,
        },
        categories,
        products,
        tags,
        whatsapp: {
          number: whatsappSettings.number || storeSettings.whatsappNumber || '+918560078208',
          templates: {
            greeting: whatsappSettings.templates?.greeting || 'Hi {{businessName}}!',
            order: whatsappSettings.templates?.order || 'Order: {{items}} Total: {{total}}',
            footer: whatsappSettings.templates?.footer || 'Thank you!',
          },
        },
        ui: {
          primaryColor: uiSettings.primaryColor || '#b71c1c',
          accentColor: uiSettings.accentColor || '#F4F1EA',
          borderRadius: uiSettings.borderRadius || 'md',
        },
      };

      // 12. Get current Firebase Auth token
      const idToken = (await auth.currentUser.getIdToken()) || 'authenticated_session';

      // 13. POST to Edge Publish API
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
    onError: (error: Error) => {
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
