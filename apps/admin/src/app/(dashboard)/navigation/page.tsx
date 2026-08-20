'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
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

export default function NavigationPage() {
  const queryClient = useQueryClient();

  const { data: nav, isLoading } = useQuery({
    queryKey: ['settings', 'navigation'],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'settings', 'navigation'));
      return snap.exists()
        ? (snap.data() as NavigationData)
        : {
            items: [
              {
                id: crypto.randomUUID(),
                label: 'Home',
                url: 'https://example.com',
                icon: 'HOME' as NavIcon,
                visible: true,
                sortOrder: 0,
              },
              {
                id: crypto.randomUUID(),
                label: 'Products',
                url: 'https://example.com/products',
                icon: 'MENU' as NavIcon,
                visible: true,
                sortOrder: 1,
              },
            ],
          };
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NavigationData>({
    resolver: zodResolver(z.object({ items: z.array(NavigationItemSchema) })) as any,
    values: nav,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  });

  const mutation = useMutation({
    mutationFn: async (data: NavigationData) => {
      await setDoc(doc(db, 'settings', 'navigation'), data, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'navigation'] });
      alert('Navigation saved successfully!');
    },
    onError: (error: Error) => {
      alert('Failed to save navigation: ' + error.message);
    },
  });

  const onSubmit = (data: NavigationData) => {
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
        <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
        <p className="text-muted-foreground mt-1">
          Manage the top-level links in your storefront header.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)}>
        <Card>
          <CardHeader>
            <CardTitle>Header Menu</CardTitle>
            <CardDescription>
              Drag to reorder links. These appear globally across your site.
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
                  onClick={() => index > 0 && move(index, index - 1)} // Simple up/down for now instead of full drag-drop
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
                      placeholder="/path or https://"
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
                  url: 'https://',
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
              Save Navigation
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
