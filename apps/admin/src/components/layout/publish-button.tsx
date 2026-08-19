"use client";

import { CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

export function PublishButton() {
  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Authorization": "Bearer dummy_token_for_now",
          "x-api-key": process.env.NEXT_PUBLIC_PUBLISH_API_KEY || "",
        }
      });
      
      const data = await res.json() as { error?: string; message?: string; version?: string; sizeKB?: number };
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish");
      }
      return data;
    },
    onSuccess: (data) => {
      alert(`✅ ${data.message}\nVersion: ${data.version}\nSize: ${data.sizeKB}KB`);
    },
    onError: (error) => {
      alert(`❌ Publishing Failed: ${error.message}`);
    }
  });

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="hidden sm:flex gap-2 border-primary/20 hover:bg-primary/5"
      onClick={() => publishMutation.mutate()}
      disabled={publishMutation.isPending}
    >
      {publishMutation.isPending ? (
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      ) : (
        <CloudUpload className="h-4 w-4 text-primary" />
      )}
      <span className="text-primary font-medium">
        {publishMutation.isPending ? "Publishing..." : "Publish Changes"}
      </span>
    </Button>
  );
}
