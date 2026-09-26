"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { CategoryWithItems } from "./types";

interface CategoryNavProps {
  categories: CategoryWithItems[];
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
}

export function CategoryNav({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryNavProps) {
  const [isStuck, setIsStuck] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      {
        rootMargin: "-57px 0px 0px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={observerRef} className="h-px w-full -mb-px pointer-events-none" />
      <div
        className={`sticky top-[57px] z-20 bg-white backdrop-blur-md ${
          isStuck ? "pt-10 pb-4" : "py-2 pb-4"
        } -mx-4 px-4 border-b border-[#E5E3DB]/60 transition-all duration-200`}
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x py-0.5">
          <button
            onClick={() => onSelectCategory("popular")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 snap-start flex items-center gap-1.5 ${
              activeCategory === "popular"
                ? "bg-[#183B32] text-white shadow-xs"
                : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Popular</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 snap-start ${
                activeCategory === cat.id
                  ? "bg-[#183B32] text-white shadow-xs"
                  : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
              }`}
            >
              {cat.name}
            </button>
          ))}

          <button
            onClick={() => onSelectCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 snap-start ${
              activeCategory === "all"
                ? "bg-[#183B32] text-white shadow-xs"
                : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
            }`}
          >
            All Items
          </button>
        </div>
      </div>
    </>
  );
}

