"use client";

import { Utensils } from "lucide-react";
import { LocationInfo } from "./types";

interface MenuHeaderProps {
  location: LocationInfo;
}

export function MenuHeader({ location }: MenuHeaderProps) {
  return (
    <header className="bg-white border-b border-[#E5E3DB] sticky top-0 z-30 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
            <Utensils className="w-4 h-4 text-stone-300" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-stone-900 leading-tight truncate">
              Splendo Hotel & Suites
            </h1>
            <p className="text-xs text-stone-500 font-medium truncate flex items-center gap-1">
              <span>{location.name}</span>
              <span>·</span>
              <span>Room Service</span>
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
