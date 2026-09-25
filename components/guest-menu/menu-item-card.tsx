"use client";

import { Clock, Plus } from "lucide-react";
import { MenuItem, formatPrice } from "./types";

interface MenuItemCardProps {
  dish: MenuItem;
  quantity: number;
  updateQuantity: (dish: MenuItem, delta: number) => void;
  isPopularItem?: boolean;
}

export function MenuItemCard({
  dish,
  quantity,
  updateQuantity,
  isPopularItem = false,
}: MenuItemCardProps) {
  return (
    <div
      className={`bg-white p-3.5 rounded-2xl border border-[#E5E3DB] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-start gap-3.5 transition-all ${
        isPopularItem ? "ring-1 ring-[#183B32]/10" : ""
      }`}
    >
      {/* Optional Image Thumbnail - ONLY rendered if imageUrl exists */}
      {dish.imageUrl ? (
        <div
          className={`rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100 relative ${
            isPopularItem
              ? "w-22 h-22 sm:w-24 sm:h-24"
              : "w-20 h-20 sm:w-22 sm:h-22"
          }`}
        >
          <img
            src={dish.imageUrl}
            alt={dish.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      {/* Text Details & Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
            {dish.title}
          </h4>
          {dish.subtitle && (
            <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-snug font-sans">
              {dish.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 text-sm sm:text-base">
              {formatPrice(dish.price)}
            </span>
            {dish.prepTime && (
              <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
                <Clock className="w-3 h-3 text-stone-400" />
                {dish.prepTime}
              </span>
            )}
          </div>

          {/* Inline Quantity Control */}
          <div>
            {quantity === 0 ? (
              <button
                onClick={() => updateQuantity(dish, 1)}
                className="h-9 px-3.5 bg-[#183B32] text-white text-xs font-semibold rounded-full hover:bg-[#112D26] active:scale-95 transition-all flex items-center gap-1 shadow-xs shrink-0"
                aria-label={`Add ${dish.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center bg-[#183B32]/10 border border-[#183B32]/30 rounded-full p-0.5 shadow-xs shrink-0">
                <button
                  onClick={() => updateQuantity(dish, -1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-stone-900 hover:bg-stone-100 font-bold flex items-center justify-center text-xs active:scale-90 transition-transform shadow-xs"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-6 text-center font-mono text-xs font-bold text-[#183B32]">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(dish, 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#183B32] text-white hover:bg-[#112D26] font-bold flex items-center justify-center text-xs active:scale-90 transition-transform shadow-xs"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
