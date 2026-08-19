"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Tag, TagSchema } from "@omkara/core-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Loader2, Save } from "lucide-react";

interface TagEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
}

const ICONS = ["none", "leaf", "flame", "sparkle", "droplet", "shield"] as const;

export function TagEditor({ open, onOpenChange, tag }: TagEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!tag;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Tag>({
    resolver: zodResolver(TagSchema),
    defaultValues: {
      id: "",
      name: "",
      icon: "none",
    }
  });

  useEffect(() => {
    if (tag) {
      reset(tag);
    } else {
      reset({
        id: "tag_" + Date.now().toString(),
        name: "",
        icon: "none",
      });
    }
  }, [tag, reset]);

  const mutation = useMutation({
    mutationFn: async (data: Tag) => {
      // Auto-generate slug style ID if missing
      if (!data.id || data.id.startsWith("tag_")) {
        data.id = "tag_" + data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      await setDoc(doc(db, "tags", data.id), data, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      alert("Failed to save tag: " + error.message);
    }
  });

  const onSubmit = (data: Tag) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? "Edit Tag" : "New Tag"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update tag details." : "Create a new tag to highlight products."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tag Name *</Label>
              <Input {...register("name")} placeholder="e.g. Organic" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>System ID</Label>
              <Input {...register("id")} placeholder="Leave blank to auto-generate" disabled={isEditing} />
              <p className="text-xs text-muted-foreground">Internal identifier. Cannot be changed after creation.</p>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <select 
                {...register("icon")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {ICONS.map(i => (
                  <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <SheetFooter className="mt-6 pt-4 border-t sticky bottom-0 bg-background pb-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Tag
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
