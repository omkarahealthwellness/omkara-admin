"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { WhatsAppTemplatesSchema, WhatsAppTemplates } from "@omkara/core-schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";

export default function WhatsAppTemplatesPage() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["settings", "whatsapp"],
    staleTime: 1000 * 60 * 30, // 30 minutes
    queryFn: async () => {
      const snap = await getDoc(doc(db, "settings", "whatsapp_templates"));
      return snap.exists() ? (snap.data() as WhatsAppTemplates) : {
        greeting: "Hi Omkara, I would like to place an order.",
        order: "Here is my order:\n{{items}}\nTotal: {{total}}",
        footer: "Please confirm my order. Thank you!",
      };
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<WhatsAppTemplates>({
    resolver: zodResolver(WhatsAppTemplatesSchema),
    values: templates,
  });

  const mutation = useMutation({
    mutationFn: async (data: WhatsAppTemplates) => {
      await setDoc(doc(db, "settings", "whatsapp_templates"), data, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "whatsapp"] });
      alert("WhatsApp templates saved successfully!");
    },
    onError: (error: Error) => {
      alert("Failed to save templates: " + error.message);
    }
  });

  const onSubmit = (data: WhatsAppTemplates) => {
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
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Checkout</h1>
        <p className="text-muted-foreground mt-1">
          Customize the pre-filled message sent to your phone when a customer checks out.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>
              Use {"{{items}}"} to inject the cart contents and {"{{total}}"} for the total amount.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Greeting Message *</Label>
              <textarea 
                {...register("greeting")} 
                placeholder="Hi, I would like to place an order." 
                rows={2} 
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              {errors.greeting && <p className="text-sm text-destructive">{errors.greeting.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Order Summary format *</Label>
              <p className="text-xs text-muted-foreground mb-2">Must contain {"{{items}}"} and {"{{total}}"}.</p>
              <textarea 
                {...register("order")} 
                placeholder="My order is:\n{{items}}\n\nTotal: {{total}}" 
                rows={4} 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Footer Message *</Label>
              <textarea 
                {...register("footer")} 
                placeholder="Please let me know how to pay." 
                rows={2} 
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              {errors.footer && <p className="text-sm text-destructive">{errors.footer.message}</p>}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Preview</h4>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                {templates?.greeting || "Greeting"}
                {"\n\n"}
                - 1x Organic Sprouts (₹499)
                {"\n"}
                - 2x Bikaner Sweets (₹1000)
                {"\n\n"}
                Total: ₹1499
                {"\n\n"}
                {templates?.footer || "Footer"}
              </p>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end border-t pt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Templates
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
