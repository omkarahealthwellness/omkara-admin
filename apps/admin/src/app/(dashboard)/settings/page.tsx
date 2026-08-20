'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { StoreSettingsSchema, StoreSettings } from '@omkara/core-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

const DEFAULT_SETTINGS: StoreSettings = {
  id: 'main',
  businessName: 'Omkara',
  logo: { url: '/logo.svg', alt: 'Store logo' },
  tagline: 'Natural Wellness from Bikaner',
  phone: '+918560078208',
  whatsappNumber: '+918560078208',
  social: {},
};

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Fetch settings from Firestore safely
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings', 'main'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'store'));
        if (snap.exists()) {
          const data = snap.data();
          const loaded = (data.storeSettings || data.store || data) as StoreSettings;
          return {
            ...DEFAULT_SETTINGS,
            ...loaded,
            logo: loaded.logo?.url ? loaded.logo : DEFAULT_SETTINGS.logo,
          };
        }
      } catch (e) {
        console.warn('Could not load settings doc, using defaults', e);
      }
      return DEFAULT_SETTINGS;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreSettings>({
    resolver: zodResolver(StoreSettingsSchema) as any,
    defaultValues: DEFAULT_SETTINGS,
    values: settings || DEFAULT_SETTINGS,
  });

  // Mutation to save settings to Firestore
  const mutation = useMutation({
    mutationFn: async (newSettings: StoreSettings) => {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to save settings. Please sign in at /login.');
      }

      // Clean up fields to ensure valid structure
      const payload: StoreSettings = {
        id: 'main',
        businessName: newSettings.businessName.trim(),
        logo: {
          url: newSettings.logo?.url?.trim() || '/logo.svg',
          alt: newSettings.logo?.alt?.trim() || 'Store logo',
        },
        tagline: newSettings.tagline?.trim() || undefined,
        phone: newSettings.phone.trim(),
        email: newSettings.email?.trim() || undefined,
        address: newSettings.address?.trim() || undefined,
        social: newSettings.social || {},
        whatsappNumber: newSettings.whatsappNumber.trim(),
      };

      await setDoc(doc(db, 'settings', 'store'), { storeSettings: payload }, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'main'] });
      alert('✅ Settings saved successfully! Click "Publish Changes" in the top bar to update the live store.');
    },
    onError: (error: Error) => {
      alert('❌ Failed to save settings: ' + error.message);
    },
  });

  const onSubmit = (data: StoreSettings) => {
    mutation.mutate(data);
  };

  const onInvalid = (fieldErrors: any) => {
    console.error('Validation errors:', fieldErrors);
    const messages = Object.entries(fieldErrors)
      .map(([key, val]: [string, any]) => `${key}: ${val?.message || 'Invalid'}`)
      .join('\n');
    alert('Please correct the following before saving:\n' + messages);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your global store configuration.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any, onInvalid)}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic details about your business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" {...register('businessName')} placeholder="e.g. Omkara" />
              {errors.businessName && (
                <p className="text-sm text-destructive">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register('tagline')} placeholder="e.g. Premium Health & Wellness" />
              {errors.tagline && (
                <p className="text-sm text-destructive">{errors.tagline.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo.url">Logo URL *</Label>
              <Input
                id="logo.url"
                {...register('logo.url')}
                placeholder="/logo.svg or https://cdn.jsdelivr.net/..."
              />
              {errors.logo?.url && (
                <p className="text-sm text-destructive">{errors.logo.url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo.alt">Logo Alt Text</Label>
              <Input id="logo.alt" {...register('logo.alt')} placeholder="Store logo" />
              {errors.logo?.alt && (
                <p className="text-sm text-destructive">{errors.logo.alt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone *</Label>
              <Input id="phone" {...register('phone')} placeholder="e.g. +918560078208" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number (E.164, e.g. +918560078208) *</Label>
              <Input
                id="whatsappNumber"
                {...register('whatsappNumber')}
                placeholder="+918560078208"
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-destructive">{errors.whatsappNumber.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
