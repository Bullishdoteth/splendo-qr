"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, TrendingUp, ShoppingBag, Clock, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  locationName: string;
  totalAmount: number;
  status: "received" | "in_kitchen" | "delivering" | "delivered" | "cancelled";
  specialInstructions: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard orders:", err);
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metrics
  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === todayStr
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrders = orders.filter(
    (o) => o.status === "received" || o.status === "in_kitchen" || o.status === "delivering"
  );
  const prepOrders = orders.filter(
    (o) => o.status === "received" || o.status === "in_kitchen"
  );
  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return {
          label: "Order Received",
          style: "bg-black text-white border-black",
        };
      case "in_kitchen":
        return {
          label: "Preparing",
          style: "bg-amber-100/80 text-amber-900 border-amber-200/80",
        };
      case "delivering":
        return {
          label: "In Transit",
          style: "bg-blue-100/80 text-blue-900 border-blue-200/80",
        };
      case "delivered":
        return {
          label: "Delivered",
          style: "bg-stone-100 text-stone-700 border-stone-200",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          style: "bg-red-100 text-red-700 border-red-200",
        };
      default:
        return {
          label: status,
          style: "bg-stone-100 text-stone-700 border-stone-200",
        };
    }
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-10 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E2DC]">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-500">
            Staff Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1 tracking-tight flex items-center gap-3">
            <span>Dashboard Overview</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            className="p-2 rounded-xl bg-white border border-[#E2E2DC] text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>View Live Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Revenue</span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900">
            {formatPrice(todayRevenue > 0 ? todayRevenue : totalRevenue)}
          </p>
          <p className="text-xs text-stone-500 font-medium">
            {todayOrders.length} {todayOrders.length === 1 ? "order" : "orders"} placed today
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{activeOrders.length}</p>
          <p className="text-xs text-stone-500 font-medium">
            {prepOrders.length} requiring preparation
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Delivered Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{deliveredOrders.length}</p>
          <p className="text-xs text-stone-500 font-medium">Completed room requests</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900">{orders.length}</p>
          <p className="text-xs text-stone-500 font-medium">Recorded in database</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl border border-[#E2E2DC] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
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
    </div>
  );
}
