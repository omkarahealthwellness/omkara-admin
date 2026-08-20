'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { HeroSchema, Hero } from '@omkara/core-schemas';
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

const DEFAULT_HERO: Hero = {
  heading: 'Welcome to Omkara',
  subheading: 'Premium Health & Wellness from Bikaner',
  image: { url: '/images/hero_bg.webp', alt: 'Hero background' },
  focal: { x: 50, y: 50 },
  visible: true,
  overlayOpacity: 40,
};

export default function HeroPage() {
  const queryClient = useQueryClient();

  const { data: hero } = useQuery({
    queryKey: ['settings', 'hero'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'hero'));
        if (snap.exists()) {
          const loaded = snap.data() as Hero;
          return {
            ...DEFAULT_HERO,
            ...loaded,
            image: loaded.image?.url ? loaded.image : DEFAULT_HERO.image,
            focal: loaded.focal || DEFAULT_HERO.focal,
          };
        }
      } catch (e) {
        console.warn('Hero doc fetch error, using defaults', e);
      }
      return DEFAULT_HERO;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Hero>({
    resolver: zodResolver(HeroSchema) as any,
    defaultValues: DEFAULT_HERO,
    values: hero || DEFAULT_HERO,
  });

  const mutation = useMutation({
    mutationFn: async (data: Hero) => {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to save hero settings. Please sign in at /login.');
      }

      const payload: Hero = {
        heading: data.heading?.trim() || undefined,
        subheading: data.subheading?.trim() || undefined,
        image: data.image?.url?.trim()
          ? { url: data.image.url.trim(), alt: data.image.alt?.trim() || 'Hero image' }
          : undefined,
        focal: {
          x: Number(data.focal?.x ?? 50),
          y: Number(data.focal?.y ?? 50),
        },
        visible: data.visible !== false,
        overlayOpacity: Number(data.overlayOpacity ?? 40),
      };

      await setDoc(doc(db, 'settings', 'hero'), payload, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'hero'] });
      alert('✅ Hero banner saved successfully! Click "Publish Changes" to push live.');
    },
    onError: (error: Error) => {
      alert('❌ Failed to save hero settings: ' + error.message);
    },
  });

  const onSubmit = (data: Hero) => {
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
        <h1 className="text-3xl font-bold tracking-tight">Hero Section</h1>
        <p className="text-muted-foreground mt-1">Customize the landing page hero banner.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any, onInvalid)}>
        <Card>
          <CardHeader>
            <CardTitle>Hero Content</CardTitle>
            <CardDescription>
              This is the first thing your customers see on the storefront.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input {...register('heading')} placeholder="e.g. Welcome to Omkara" />
              {errors.heading && (
                <p className="text-sm text-destructive">{errors.heading.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Subheading</Label>
              <textarea
                {...register('subheading')}
                placeholder="A compelling subtitle..."
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Background Image URL</Label>
              <Input {...register('image.url')} placeholder="/images/hero_bg.webp or https://..." />
              <p className="text-xs text-muted-foreground">
                Enter an image URL or leave default.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Image Alt Text</Label>
              <Input
                {...register('image.alt')}
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Focal Point X (%)</Label>
                <Input type="number" {...register('focal.x', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Focal Point Y (%)</Label>
                <Input type="number" {...register('focal.y', { valueAsNumber: true })} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mutation.isPending ? 'Saving...' : 'Save Hero'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
