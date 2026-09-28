"use client";

import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Order, formatPrice, getStatusBadge } from "./types";

interface RecentActivityProps {
  orders: Order[];
  loading?: boolean;
}

export function RecentActivity({ orders, loading = false }: RecentActivityProps) {
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E2DC] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] font-sans">
      <div className="p-6 border-b border-[#E2E2DC] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Recent Room Service Activity</h2>
          <p className="text-xs text-stone-500 mt-0.5">Live status of guest orders from database.</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-stone-900 hover:underline flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-stone-900" />
          <p className="text-xs font-medium">Fetching real-time activity...</p>
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-stone-500">
          No room service orders recorded in database yet.
        </div>
      ) : (
        <div className="divide-y divide-[#E2E2DC]">
          {recentOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const itemSummary = order.items
              .map((i) => `${i.quantity}x ${i.title}`)
              .join(", ");

            return (
              <div
                key={order.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 text-sm">
                      {order.locationName}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">• #{order.id}</span>
                  </div>
                  <p className="text-xs text-stone-600 truncate">
                    {itemSummary || "Room Service Order"}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E2DC]/60">
                  <span className="font-mono text-sm font-semibold text-stone-900">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
