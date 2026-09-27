"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function OrderHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E3DB] px-4 sm:px-8 py-4 font-sans">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          href="/menu"
          className="flex items-center gap-2 text-stone-700 hover:text-stone-900 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-black" />
          <span>Back to Menu</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            Splendo Room Service
          </span>
        </div>
      </div>
    </header>
  );
}
