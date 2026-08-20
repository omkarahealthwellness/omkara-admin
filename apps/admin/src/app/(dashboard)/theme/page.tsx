'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { UIConfigSchema, UIConfig } from '@omkara/core-schemas';
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

const DEFAULT_THEME: UIConfig = {
  primaryColor: '#b71c1c',
  accentColor: '#F4F1EA',
  borderRadius: 'md',
};

export default function ThemePage() {
  const queryClient = useQueryClient();

  const { data: theme } = useQuery({
    queryKey: ['settings', 'theme'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'ui_config'));
        if (snap.exists()) {
          const loaded = snap.data() as UIConfig;
          return {
            ...DEFAULT_THEME,
            ...loaded,
          };
        }
      } catch (e) {
        console.warn('UI config doc fetch error, using defaults', e);
      }
      return DEFAULT_THEME;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UIConfig>({
    resolver: zodResolver(UIConfigSchema) as any,
    defaultValues: DEFAULT_THEME,
    values: theme || DEFAULT_THEME,
  });

  const currentPrimary = watch('primaryColor') || DEFAULT_THEME.primaryColor;
  const currentRadius = watch('borderRadius') || DEFAULT_THEME.borderRadius;

  const mutation = useMutation({
    mutationFn: async (data: UIConfig) => {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to save theme settings. Please sign in at /login.');
      }

      const payload: UIConfig = {
        primaryColor: data.primaryColor?.trim() || '#b71c1c',
        accentColor: data.accentColor?.trim() || undefined,
        borderRadius: data.borderRadius || 'md',
      };

      await setDoc(doc(db, 'settings', 'ui_config'), payload, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'theme'] });
      alert('✅ Theme settings saved successfully! Click "Publish Changes" to update the live store.');
    },
    onError: (error: Error) => {
      alert('❌ Failed to save theme settings: ' + error.message);
    },
  });

  const onSubmit = (data: UIConfig) => {
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
        <h1 className="text-3xl font-bold tracking-tight">Theme Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize the colors and styling of your storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any, onInvalid)}>
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>
              Set your primary brand colors for buttons, links, and highlights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Primary Color (Hex) *</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1 cursor-pointer"
                    {...register('primaryColor')}
                  />
                  <Input {...register('primaryColor')} className="flex-1 font-mono uppercase" />
                </div>
                {errors.primaryColor && (
                  <p className="text-sm text-destructive">{errors.primaryColor.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Accent Color (Hex)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    className="w-12 h-10 p-1 cursor-pointer"
                    {...register('accentColor')}
                  />
                  <Input {...register('accentColor')} className="flex-1 font-mono uppercase" />
                </div>
                {errors.accentColor && (
                  <p className="text-sm text-destructive">{errors.accentColor.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Border Radius</Label>
              <select
                {...register('borderRadius')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="none">None (Square edges)</option>
                <option value="sm">Small (Subtle curve)</option>
                <option value="md">Medium (Default rounded)</option>
                <option value="lg">Large (Softer corners)</option>
              </select>
              {errors.borderRadius && (
                <p className="text-sm text-destructive">{errors.borderRadius.message}</p>
              )}
            </div>

            <div className="p-6 bg-muted/50 rounded-lg border mt-6 flex flex-col items-center gap-4">
              <h4 className="font-semibold text-sm mb-2 w-full">Live Button Preview</h4>
              <button
                type="button"
                className="px-6 py-3 text-white font-medium shadow transition-all"
                style={{
                  backgroundColor: currentPrimary || '#b71c1c',
                  borderRadius:
                    currentRadius === 'none'
                      ? '0'
                      : currentRadius === 'sm'
                        ? '0.25rem'
                        : currentRadius === 'lg'
                          ? '1rem'
                          : '0.5rem',
                }}
              >
                Sample Store Button
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mutation.isPending ? 'Saving...' : 'Save Theme'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
