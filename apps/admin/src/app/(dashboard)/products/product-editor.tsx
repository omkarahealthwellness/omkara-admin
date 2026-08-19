"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Product, ProductSchema } from "@omkara/core-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Loader2, Save } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { z } from "zod";

const FormSchema = ProductSchema.extend({
  slug: z.string().optional().or(z.literal("")),
});

interface ProductEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductEditor({ open, onOpenChange, product }: ProductEditorProps) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Product>({
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      id: "",
      name: "",
      slug: "",
      shortDescription: "",
      longDescription: "",
      categoryId: "",
      tags: [],
      featuredTagIds: [],
      status: "AVAILABLE",
      primaryImage: { url: "", focal: { x: 50, y: 50 } },
      gallery: [],
      variants: [{ id: "v1", name: "Default", price: 0, isDefault: true, available: true, sortOrder: 0 }],
      addons: [],
      note: { enabled: true, maxChars: 250 },
      sortOrder: 0,
    }
  });

  const status = watch("status");

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      reset(product);
    } else {
      reset({
        id: "prod_" + Date.now().toString(),
        name: "",
        slug: "",
        shortDescription: "",
        longDescription: "",
        categoryId: "",
        tags: [],
        featuredTagIds: [],
        status: "AVAILABLE",
        primaryImage: { url: "", focal: { x: 50, y: 50 } },
        gallery: [],
        variants: [{ id: "v1", name: "Default", price: 0, isDefault: true, available: true, sortOrder: 0 }],
        addons: [],
        note: { enabled: true, maxChars: 250 },
        sortOrder: 0,
      });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: async (data: Product) => {
      // Auto-generate slug if empty
      if (!data.slug) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      await setDoc(doc(db, "products", data.id), data, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      alert("Failed to save product: " + error.message);
    }
  });

  const onSubmit = (data: Product) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto" side="right">
        <SheetHeader className="mb-6">
          <SheetTitle>{isEditing ? "Edit Product" : "New Product"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update product details and pricing." : "Add a new product to your catalog."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="space-y-0.5">
                <Label>Availability Status</Label>
                <p className="text-sm text-muted-foreground">Select current product status.</p>
              </div>
              <select 
                {...register("status")}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD_OUT">Sold Out</option>
                <option value="HIDDEN">Hidden</option>
              </select>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input {...register("name")} placeholder="e.g. Mixed Sprouts" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input {...register("slug")} placeholder="Leave blank to auto-generate" />
            </div>

            <div className="space-y-2">
              <Label>Short Description</Label>
              <Input {...register("shortDescription")} placeholder="Brief tagline..." />
              {errors.shortDescription && <p className="text-sm text-destructive">{errors.shortDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Long Description</Label>
              <textarea 
                {...register("longDescription")} 
                placeholder="Full product description..." 
                rows={4} 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              {errors.longDescription && <p className="text-sm text-destructive">{errors.longDescription.message}</p>}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label>Default Variant Price (Paise) *</Label>
              <Input type="number" {...register("variants.0.price", { valueAsNumber: true })} />
              <p className="text-xs text-muted-foreground">100 paise = 1 INR</p>
              {errors.variants?.[0]?.price && <p className="text-sm text-destructive">{errors.variants[0].price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Category ID *</Label>
              <Input {...register("categoryId")} placeholder="e.g. cat_sprouts" />
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Primary Image</Label>
              <ImageUpload
                repo="products"
                value={watch("primaryImage.url")}
                onChange={(url) => setValue("primaryImage.url", url, { shouldValidate: true })}
              />
              {errors.primaryImage?.url && <p className="text-sm text-destructive">{errors.primaryImage.url.message}</p>}
              <p className="text-xs text-muted-foreground">Assets are uploaded directly to GitHub and served via jsDelivr CDN.</p>
            </div>
          </div>

          <SheetFooter className="mt-6 pt-4 border-t sticky bottom-0 bg-background pb-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Product
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
