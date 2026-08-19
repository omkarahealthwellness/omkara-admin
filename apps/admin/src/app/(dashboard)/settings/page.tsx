"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { StoreSettingsSchema, StoreSettings } from "@omkara/core-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Fetch settings from Firestore
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "main"],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      const snap = await getDoc(doc(db, "settings", "store"));
      return snap.exists() ? (snap.data().storeSettings as StoreSettings) : {
        id: "main",
        businessName: "Omkara",
        logo: { url: "https://example.com/logo.png", alt: "Store logo" },
        phone: "+919876543210",
        whatsappNumber: "+919876543210",
        social: {},
      } as StoreSettings;
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<StoreSettings>({
    resolver: zodResolver(StoreSettingsSchema) as any,
    values: settings,
  });

  // Mutation to save settings to Firestore
  const mutation = useMutation({
    mutationFn: async (newSettings: StoreSettings) => {
      await setDoc(doc(db, "settings", "store"), { storeSettings: newSettings }, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "store"] });
      alert("Settings saved successfully!");
    },
    onError: (error: Error) => {
      alert("Failed to save settings: " + error.message);
    }
  });

  const onSubmit = (data: StoreSettings) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your global store configuration.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)}>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Basic details about your business.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input id="businessName" {...register("businessName")} placeholder="e.g. Omkara" />
              {errors.businessName && <p className="text-sm text-destructive">{errors.businessName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register("tagline")} placeholder="e.g. Premium Health" />
              {errors.tagline && <p className="text-sm text-destructive">{errors.tagline.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo.url">Logo URL *</Label>
              <Input id="logo.url" {...register("logo.url")} placeholder="https://cdn.jsdelivr.net/gh/..." />
              {errors.logo?.url && <p className="text-sm text-destructive">{errors.logo.url.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo.alt">Logo Alt Text</Label>
              <Input id="logo.alt" {...register("logo.alt")} placeholder="Store logo" />
              {errors.logo?.alt && <p className="text-sm text-destructive">{errors.logo.alt.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone *</Label>
              <Input id="phone" {...register("phone")} placeholder="e.g. +91 9876543210" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number (E.164) *</Label>
              <Input id="whatsappNumber" {...register("whatsappNumber")} placeholder="e.g. +919876543210" />
              {errors.whatsappNumber && <p className="text-sm text-destructive">{errors.whatsappNumber.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
