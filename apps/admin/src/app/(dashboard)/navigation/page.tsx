'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { NavigationItemSchema } from '@omkara/core-schemas';
import { z } from 'zod';
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
import { Loader2, Save, Plus, GripVertical, Trash2 } from 'lucide-react';
import { NavIcon } from '@omkara/core-schemas';

type NavigationData = {
  items: {
    id: string;
    label: string;
    url: string;
    icon: NavIcon;
    visible: boolean;
    sortOrder: number;
  }[];
};

const DEFAULT_NAVIGATION: NavigationData = {
  items: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      label: 'Home',
      url: '/',
      icon: 'HOME' as NavIcon,
      visible: true,
      sortOrder: 0,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      label: 'Shop All',
      url: '/products',
      icon: 'MENU' as NavIcon,
      visible: true,
      sortOrder: 1,
    },
  ],
};

export default function NavigationPage() {
  const queryClient = useQueryClient();

  const { data: nav } = useQuery({
    queryKey: ['settings', 'navigation'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'navigation'));
        if (snap.exists()) {
          const loaded = snap.data() as NavigationData;
          if (Array.isArray(loaded.items) && loaded.items.length > 0) {
            return loaded;
          }
        }
      } catch (e) {
        console.warn('Navigation doc fetch error, using defaults', e);
      }
      return DEFAULT_NAVIGATION;
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NavigationData>({
    resolver: zodResolver(z.object({ items: z.array(NavigationItemSchema) })) as any,
    defaultValues: DEFAULT_NAVIGATION,
    values: nav || DEFAULT_NAVIGATION,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  });

  const mutation = useMutation({
    mutationFn: async (data: NavigationData) => {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to save navigation. Please sign in at /login.');
      }

      const items = data.items.map((item, idx) => ({
        id: item.id || crypto.randomUUID(),
        label: item.label.trim(),
        url: item.url.trim(),
        icon: item.icon || 'HOME',
        visible: item.visible !== false,
        sortOrder: idx,
      }));

      await setDoc(doc(db, 'settings', 'navigation'), { items }, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'navigation'] });
      alert('✅ Navigation saved successfully! Click "Publish Changes" to push live.');
    },
    onError: (error: Error) => {
      alert('❌ Failed to save navigation: ' + error.message);
    },
  });

  const onSubmit = (data: NavigationData) => {
    mutation.mutate(data);
  };

  const onInvalid = (fieldErrors: any) => {
    console.error('Validation errors:', fieldErrors);
    const messages = Object.entries(fieldErrors)
      .map(([key, val]: [string, any]) => `${key}: ${JSON.stringify(val)}`)
      .join('\n');
    alert('Please correct the following before saving:\n' + messages);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
        <p className="text-muted-foreground mt-1">
          Manage the top-level links in your storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any, onInvalid)}>
        <Card>
          <CardHeader>
            <CardTitle>Header Menu Links</CardTitle>
            <CardDescription>
              Add or reorder links. Use /path for internal pages (e.g. /products, /about) or https:// for external.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-3 bg-muted/30 border rounded-md group"
              >
                <button
                  type="button"
                  className="cursor-move text-muted-foreground hover:text-foreground"
                  onClick={() => index > 0 && move(index, index - 1)}
                  title="Move Up"
                >
                  <GripVertical className="h-5 w-5" />
                </button>

                <div className="flex-1 grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <Input
                      {...register(`items.${index}.label`)}
                      placeholder="Link Label"
                      className="bg-background"
                    />
                    {errors.items?.[index]?.label && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.items[index]?.label?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-5">
                    <Input
                      {...register(`items.${index}.url`)}
                      placeholder="/products or https://..."
                      className="bg-background"
                    />
                    {errors.items?.[index]?.url && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.items[index]?.url?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <select
                      {...register(`items.${index}.icon`)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="HOME">Home</option>
                      <option value="MENU">Menu</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="CALL">Call</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="FACEBOOK">Facebook</option>
                      <option value="EMAIL">Email</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full mt-4 border-dashed"
              onClick={() =>
                append({
                  id: crypto.randomUUID(),
                  label: '',
                  url: '/',
                  icon: 'HOME',
                  visible: true,
                  sortOrder: fields.length,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {mutation.isPending ? 'Saving...' : 'Save Navigation'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
