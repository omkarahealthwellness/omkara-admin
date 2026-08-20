'use client';

import { useEffect, useState, useRef } from 'react';
import type { Category } from '@omkara/core-schemas';

interface CategoryNavProps {
  categories: Category[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string>('');
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = categories
      .map((cat) => document.getElementById(`cat-${cat.id}`))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-140px 0px -60% 0px', threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (catId: string) => {
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Auto-scroll the nav pill into view
    const pill = document.getElementById(`pill-${catId}`);
    if (pill && navRef.current) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-14 md:top-[72px] z-40 bg-background border-b border-border shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto no-scrollbar px-4 py-2.5">
        {categories.map((cat) => {
          const isActive = activeId === `cat-${cat.id}`;
          return (
            <button
              key={cat.id}
              id={`pill-${cat.id}`}
              onClick={() => scrollToCategory(cat.id)}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex-shrink-0
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
