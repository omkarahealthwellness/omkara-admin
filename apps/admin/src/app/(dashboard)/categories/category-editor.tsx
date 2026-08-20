'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Category, CategorySchema } from '@omkara/core-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Loader2, Save } from 'lucide-react';
import { z } from 'zod';

const FormSchema = CategorySchema.extend({
  slug: z.string().optional().or(z.literal('')),
});

interface CategoryEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function CategoryEditor({ open, onOpenChange, category }: CategoryEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Category>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      id: '',
      name: '',
      slug: '',
      image: undefined,
      visible: true,
      sortOrder: 0,
      displayLimit: 12,
      layoutStyle: 'rail',
      seeAllLabel: 'See all →',
    },
  });

  useEffect(() => {
    if (category) {
      reset(category);
    } else {
      reset({
        id: crypto.randomUUID(),
        name: '',
        slug: '',
        image: undefined,
        visible: true,
        sortOrder: 0,
        displayLimit: 12,
        layoutStyle: 'rail',
        seeAllLabel: 'See all →',
      });
    }
  }, [category, reset]);

  const mutation = useMutation({
    mutationFn: async (data: Category) => {
      try {
        alert('Step 1: Starting save. Slug check...');
        // Auto-generate slug if empty
        if (!data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        }
        alert('Step 2: Stripping empty image...');
        // Strip empty image to prevent Zod url() validation failure
        if (data.image && (!data.image.url || data.image.url.trim() === '')) {
          delete (data as any).image;
        }
        
        alert('Step 3: Calling setDoc on Firebase...');
        await setDoc(doc(db, 'categories', data.id), data, { merge: true });
        
        alert('Step 4: setDoc finished successfully!');
      } catch (err: any) {
        alert('ERROR IN MUTATION: ' + err.message);
        throw err;
      }
    },
    onSuccess: () => {
      alert('Step 5: In onSuccess, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      alert('Step X: Failed to save category: ' + error.message);
    },
  });

  const onSubmit = (data: Category) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? 'Edit Category' : 'New Category'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update category details.' : 'Create a new collection for your products.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input {...register('name')} placeholder="e.g. Lentils" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Slug removed from UI - auto generated */}

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" {...register('sortOrder', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input {...register('image.url')} placeholder="https://cdn.jsdelivr.net/gh/..." />
              {errors.image?.url && (
                <p className="text-sm text-destructive">{errors.image.url.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Paste jsDelivr link from Omkara CDN.</p>
            </div>

            <div className="space-y-2">
              <Label>Image Alt Text</Label>
              <Input {...register('image.alt')} placeholder="Describe the image" />
            </div>
          </div>

          <SheetFooter className="mt-6 pt-4 border-t sticky bottom-0 bg-background pb-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Category
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
