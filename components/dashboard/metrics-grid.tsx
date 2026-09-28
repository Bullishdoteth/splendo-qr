"use client";

import { TrendingUp, ShoppingBag, CheckCircle2, Clock } from "lucide-react";
import { StatCard } from "./stat-card";
import { formatPrice } from "./types";

interface MetricsGridProps {
  todayRevenue: number;
  totalRevenue: number;
  todayOrdersCount: number;
  activeOrdersCount: number;
  prepOrdersCount: number;
  deliveredOrdersCount: number;
  totalOrdersCount: number;
}

export function MetricsGrid({
  todayRevenue,
  totalRevenue,
  todayOrdersCount,
  activeOrdersCount,
  prepOrdersCount,
  deliveredOrdersCount,
  totalOrdersCount,
}: MetricsGridProps) {
  const displayRevenue = todayRevenue > 0 ? todayRevenue : totalRevenue;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
      <StatCard
        title="Today's Revenue"
        value={formatPrice(displayRevenue)}
        subtitle={`${todayOrdersCount} ${todayOrdersCount === 1 ? "order" : "orders"} today`}
        icon={TrendingUp}
        iconColor="text-stone-400"
      />

      <StatCard
        title="Active Orders"
        value={activeOrdersCount}
        subtitle={`${prepOrdersCount} in kitchen`}
        icon={ShoppingBag}
        iconColor="text-stone-400"
      />

      <StatCard
        title="Delivered"
        value={deliveredOrdersCount}
        subtitle="Completed requests"
        icon={CheckCircle2}
        iconColor="text-emerald-600"
      />

      <StatCard
        title="Total Orders"
        value={totalOrdersCount}
        subtitle="In database"
        icon={Clock}
        iconColor="text-stone-400"
      />
    </div>
  );
}
