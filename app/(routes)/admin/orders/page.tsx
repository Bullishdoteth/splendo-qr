"use client";

import { useEffect, useState } from "react";
import { Clock, Filter, Loader2, RefreshCw, CheckCircle2, Utensils, Truck, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { playStatusUpdateSound } from "@/lib/utils/sound";
import { toast } from "sonner";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchOrders = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch live orders:", err);
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

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (data.order) {
        playStatusUpdateSound();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: data.order.status } : o))
        );
        toast.success(`Updated order #${orderId} to "${nextStatus.replace("_", " ")}"`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return {
          label: "Order Received",
          style: "bg-[#183B32] text-white border-[#183B32]",
          next: "in_kitchen",
          nextLabel: "Mark In Kitchen",
        };
      case "in_kitchen":
        return {
          label: "In Kitchen",
          style: "bg-amber-100 text-amber-900 border-amber-300",
          next: "delivering",
          nextLabel: "Dispatch Delivery",
        };
      case "delivering":
        return {
          label: "Out for Delivery",
          style: "bg-blue-100 text-blue-900 border-blue-300",
          next: "delivered",
          nextLabel: "Mark Delivered",
        };
      case "delivered":
        return {
          label: "Delivered",
          style: "bg-stone-100 text-stone-700 border-stone-300",
          next: null,
          nextLabel: null,
        };
      default:
        return {
          label: status,
          style: "bg-stone-100 text-stone-700 border-stone-200",
          next: null,
          nextLabel: null,
        };
    }
  };

  const filteredOrders = orders.filter(
    (o) => filterStatus === "all" || o.status === filterStatus
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E2DC]">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-500">
            Room Service Management
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1 tracking-tight flex items-center gap-3">
            <span>Live Guest Orders</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-semibold">
              Live Sync
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "received", "in_kitchen", "delivering", "delivered"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
                filterStatus === st
                  ? "bg-stone-900 text-white"
                  : "bg-white border border-[#E2E2DC] text-stone-700 hover:bg-stone-50"
              }`}
            >
              {st === "all" ? "All Orders" : st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
          <p className="text-xs font-medium">Fetching real-time guest orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E2DC] space-y-2">
          <p className="text-stone-500 text-sm">No room orders found matching filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 hover:border-stone-400 transition-all"
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E2DC]">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-stone-900">{order.locationName}</span>
                    <span className="text-xs font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      #{order.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${badge.style}`}>
                      {badge.label}
                    </span>

                    <Link
                      href={`/order/${order.id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="Open guest order log tracker"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-1.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-stone-700">
                      <span className="font-semibold text-stone-900">
                        {item.quantity}x {item.title}
                      </span>
                      <span className="font-mono text-stone-500">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {order.specialInstructions && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2">
                      <strong>Kitchen Note:</strong> {order.specialInstructions}
                    </p>
                  )}
                </div>

                {/* Bottom Row Actions */}
                <div className="pt-3 border-t border-[#E2E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Total</span>
                    <span className="font-mono text-lg font-bold text-stone-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>

                  {badge.next && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, badge.next!)}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                    >
                      Advance Status → {badge.nextLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
