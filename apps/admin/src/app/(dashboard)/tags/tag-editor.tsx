'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Tag, TagSchema } from '@omkara/core-schemas';
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

interface TagEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
}

const ICONS = ['🌱', '🔥', '✨', '💧', '🛡️'];

export function TagEditor({ open, onOpenChange, tag }: TagEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!tag;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Tag>({
    resolver: zodResolver(TagSchema),
    defaultValues: {
      id: '',
      name: '',
      icon: '🌱',
      color: '#16a34a',
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (tag) {
      reset(tag);
    } else {
      reset({
        id: crypto.randomUUID(),
        name: '',
        icon: '🌱',
        color: '#16a34a',
        sortOrder: 0,
      });
    }
  }, [tag, reset]);

  const mutation = useMutation({
    mutationFn: async (data: Tag) => {
      await setDoc(doc(db, 'tags', data.id), data, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      alert('Failed to save tag: ' + error.message);
    },
  });

  const onSubmit = (data: Tag) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? 'Edit Tag' : 'New Tag'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update tag details.' : 'Create a new tag to highlight products.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tag Name *</Label>
              <Input {...register('name')} placeholder="e.g. Organic" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Icon Emoji (Max 2 chars) *</Label>
              <Input {...register('icon')} placeholder="e.g. 🌱" maxLength={2} />
              {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tag Color (Hex) *</Label>
              <Input {...register('color')} type="color" className="h-10 p-1 cursor-pointer" />
              {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" {...register('sortOrder', { valueAsNumber: true })} />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">{errors.sortOrder.message}</p>
              )}
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
              Save Tag
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
