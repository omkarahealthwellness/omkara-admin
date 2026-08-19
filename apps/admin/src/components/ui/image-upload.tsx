"use client";

import { useState, useRef, useCallback } from "react";
import { uploadToGithub } from "@/lib/github/upload";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X, Crosshair } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  repo?: "core" | "products" | "content";
  folder?: string;
}

export function ImageUpload({ value, onChange, repo = "products", folder = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeAndCompress = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to webp
          const dataUrl = canvas.toDataURL("image/webp", 0.85);
          resolve(dataUrl);
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    try {
      setIsUploading(true);
      const base64 = await resizeAndCompress(file);
      
      // Rename file to .webp since we converted it
      const newFilename = file.name.replace(/\.[^/.]+$/, "") + `_${Date.now()}.webp`;
      
      const cdnUrl = await uploadToGithub(base64, newFilename, repo, folder);
      onChange(cdnUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border group bg-muted aspect-video flex items-center justify-center">
          <img src={value} alt="Uploaded preview" className="max-w-full max-h-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Change
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => onChange("")}>
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              <p>Optimizing and uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <UploadCloud className="h-10 w-10 mb-4" />
              <p className="font-medium text-foreground mb-1">Click or drag image to upload</p>
              <p className="text-sm">PNG, JPG, WEBP up to 10MB</p>
            </div>
          )}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept="image/*"
        disabled={isUploading}
      />
    </div>
  );
}
