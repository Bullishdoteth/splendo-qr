"use client";

import { RefObject } from "react";
import { Sparkles } from "lucide-react";
import { CategoryWithItems, MenuItem } from "./types";
import { MenuItemCard } from "./menu-item-card";

interface MenuListProps {
  displaySections: CategoryWithItems[];
  getItemQuantity: (dishId: string) => number;
  updateQuantity: (dish: MenuItem, delta: number) => void;
  onClearSearchAndShowAll: () => void;
  menuListRef: RefObject<HTMLDivElement | null>;
}

export function MenuList({
  displaySections,
  getItemQuantity,
  updateQuantity,
  onClearSearchAndShowAll,
  menuListRef,
}: MenuListProps) {
  return (
    <div ref={menuListRef} className="space-y-6 pt-1">
      {displaySections.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-[#E5E3DB] space-y-2">
          <p className="text-stone-600 text-xs font-semibold">
            No dishes match your search.
          </p>
          <p className="text-stone-400 text-[11px]">
            Try searching for another dish or clear filters.
          </p>
          <button
            onClick={onClearSearchAndShowAll}
            className="mt-2 px-4 py-2 bg-[#183B32] text-white text-xs font-semibold rounded-full hover:bg-[#112D26]"
          >
            View All Menu Items
          </button>
        </div>
      ) : (
        displaySections.map((section) => (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
                {section.id === "popular" && (
                  <Sparkles className="w-4 h-4 text-[#183B32]" />
                )}
                <span>{section.name}</span>
              </h3>
              {section.items.length > 0 && (
                <span className="text-[11px] font-medium text-stone-400">
                  {section.items.length}{" "}
                  {section.items.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {section.items.map((dish) => {
                const qty = getItemQuantity(dish.id);
                const isPopularItem = section.id === "popular";

                return (
                  <MenuItemCard
                    key={dish.id}
                    dish={dish}
                    quantity={qty}
                    updateQuantity={updateQuantity}
                    isPopularItem={isPopularItem}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
