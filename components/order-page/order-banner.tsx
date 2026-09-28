"use client";

import { MapPin, Clock, RefreshCw } from "lucide-react";

interface OrderBannerProps {
  orderId: string;
  locationName: string;
  createdAt: string;
  status: string;
  onRefresh: () => void;
}

export function OrderBanner({
  orderId,
  locationName,
  createdAt,
  status,
  onRefresh,
}: OrderBannerProps) {
  const getStatusBadge = (s: string) => {
    switch (s) {
      case "received":
      case "in_kitchen":
        return { label: "In Kitchen", bg: "bg-amber-100 text-amber-900 border-amber-200" };
      case "delivering":
        return { label: "Out for Delivery", bg: "bg-purple-100 text-purple-900 border-purple-200" };
      case "delivered":
        return { label: "Delivered", bg: "bg-black/10 text-black border-black/20" };
      default:
        return { label: s, bg: "bg-stone-100 text-stone-800 border-stone-200" };
    }
  };

  const badge = getStatusBadge(status);
  const formattedTime = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3DB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Order #{orderId}
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-medium">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-black" />
            <strong className="text-stone-900">{locationName}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-black" />
            <span>Placed {formattedTime}</span>
          </span>
        </div>
      </div>

      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E5E3DB] bg-[#FAF9F5] text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors shrink-0 self-start sm:self-center cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Refresh Status</span>
      </button>
    </div>
  );
}
