'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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

export default function HeroPage() {
  const queryClient = useQueryClient();

  const { data: hero, isLoading } = useQuery({
    queryKey: ['settings', 'hero'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'settings', 'hero'));
      return snap.exists()
        ? (snap.data() as Hero)
        : {
            heading: 'Welcome to Omkara',
            subheading: 'Premium Quality Products',
            image: { url: '/images/hero_bg.webp', alt: 'Hero background' },
            focal: { x: 50, y: 50 },
            visible: true,
            overlayOpacity: 40,
          };
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Hero>({
    resolver: zodResolver(HeroSchema) as any,
    values: hero,
  });

  const mutation = useMutation({
    mutationFn: async (data: Hero) => {
      await setDoc(doc(db, 'settings', 'hero'), data, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'hero'] });
      alert('Hero settings saved successfully!');
    },
    onError: (error: Error) => {
      alert('Failed to save hero settings: ' + error.message);
    },
  });

  const onSubmit = (data: Hero) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hero Section</h1>
        <p className="text-muted-foreground mt-1">Customize the landing page hero banner.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)}>
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
              <Input {...register('heading')} placeholder="e.g. Elevate Your Kitchen" />
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

            {/* CTA omitted as it's not in HeroSchema anymore */}

            <div className="space-y-2 pt-4 border-t">
              <Label>Background Image URL</Label>
              <Input {...register('image.url')} placeholder="https://cdn.jsdelivr.net/gh/..." />
              <p className="text-xs text-muted-foreground">
                Enter a CDN URL (jsDelivr, Cloudinary, etc.)
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
              Save Hero
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
