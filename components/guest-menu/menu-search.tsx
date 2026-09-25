"use client";

import { Search, X } from "lucide-react";

interface MenuSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function MenuSearch({ searchQuery, setSearchQuery }: MenuSearchProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold text-stone-900 tracking-tight">
        What would you like?
      </h2>

      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search food & drinks..."
          className="w-full pl-10 pr-9 py-3 bg-white border border-[#E5E3DB] rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
