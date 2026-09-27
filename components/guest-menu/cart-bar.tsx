"use client";

import { ChevronRight } from "lucide-react";
import { formatPrice } from "./types";

interface CartBarProps {
  totalCartItems: number;
  totalCartPrice: number;
  onOpenDrawer: () => void;
}

export function CartBar({
  totalCartItems,
  totalCartPrice,
  onOpenDrawer,
}: CartBarProps) {
  if (totalCartItems === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom duration-300">
      <button
        onClick={onOpenDrawer}
        className="w-full bg-black text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center justify-between hover:bg-neutral-900 active:scale-[0.98] transition-all border border-neutral-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white/20 text-white text-xs font-mono font-bold flex items-center justify-center border border-white/30">
            {totalCartItems}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold tracking-wide leading-none">
              View order
            </p>
            <p className="text-[10px] text-stone-300 leading-tight mt-0.5">
              {totalCartItems} {totalCartItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-white">
            {formatPrice(totalCartPrice)}
          </span>
          <ChevronRight className="w-4 h-4 text-stone-300" />
        </div>
      </button>
    </div>
  );
}
