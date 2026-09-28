"use client";

import Link from "next/link";
import { ArrowUpRight, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
  showLiveBadge?: boolean;
}

export function DashboardHeader({
  onRefresh,
  title = "Dashboard Overview",
  subtitle = "Staff Portal",
  showLiveBadge = true,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E2DC]">
      <div>
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-500">
          {subtitle}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1 tracking-tight flex items-center gap-3">
          <span>{title}</span>
          {/* {showLiveBadge && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/10 text-black font-mono font-semibold">
              Live DB
            </span>
          )} */}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white border border-[#E2E2DC] text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        <Link
          href="/admin/orders"
          className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>View Live Orders</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
