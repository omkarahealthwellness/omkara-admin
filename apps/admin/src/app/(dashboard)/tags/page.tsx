'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Tag } from '@omkara/core-schemas';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Edit,
  Trash2,
  Tag as TagIcon,
  Leaf,
  Flame,
  Sparkles,
  Droplet,
  Shield,
} from 'lucide-react';
import { TagEditor } from './tag-editor';

const ICON_MAP = {
  leaf: Leaf,
  flame: Flame,
  sparkle: Sparkles,
  droplet: Droplet,
  shield: Shield,
  none: TagIcon,
};

export default function TagsPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    staleTime: 1000 * 60 * 15, // 15 minutes
    queryFn: async () => {
      const q = query(collection(db, 'tags'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Tag);
    },
  });

  const handleCreate = () => {
    setEditingTag(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsEditorOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground mt-1">
            Manage badges and properties applied to products.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Tag
        </Button>
      </div>

      <div className="bg-background border rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-3 font-medium">Tag Name</th>
                <th className="px-6 py-3 font-medium">Icon</th>
                <th className="px-6 py-3 font-medium">System ID</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Loading tags...
                  </td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No tags found. Add your first tag!
                  </td>
                </tr>
              ) : (
                tags.map((tag) => {
                  const Icon = ICON_MAP[tag.icon as keyof typeof ICON_MAP] || TagIcon;
                  return (
                    <tr key={tag.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-2">{tag.name}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted w-fit">
                          <Icon className="h-3.5 w-3.5" />
                          {tag.icon}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{tag.id}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TagEditor open={isEditorOpen} onOpenChange={setIsEditorOpen} tag={editingTag} />
    </div>
  );
}
