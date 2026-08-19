"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Category } from "@omkara/core-schemas";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryEditor } from "./category-editor";
import { Card, CardContent } from "@/components/ui/card";

export default function CategoriesPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    staleTime: 1000 * 60 * 15, // 15 minutes
    queryFn: async () => {
      const q = query(collection(db, "categories"), orderBy("displayOrder", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    }
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditorOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your products into collections.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search categories..." className="pl-9 bg-background shadow-sm" />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-background rounded-lg border border-dashed">
          <h3 className="text-lg font-medium">No categories</h3>
          <p className="text-sm text-muted-foreground mt-1">Get started by creating a new product category.</p>
          <Button onClick={handleCreate} variant="outline" className="mt-4">Create Category</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="hover:shadow-md transition-shadow group overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 bg-muted relative border-b">
                  {cat.image?.url ? (
                    <img src={cat.image.url} alt={cat.image.alt || cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm" onClick={() => handleEdit(cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8 shadow-sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{cat.slug}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryEditor 
        open={isEditorOpen} 
        onOpenChange={setIsEditorOpen} 
        category={editingCategory} 
      />
    </div>
  );
}
