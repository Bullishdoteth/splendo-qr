"use client";

import { use, useEffect, useState } from "react";
import { Bell, Utensils, Truck, CheckCircle2, X, RefreshCw, Loader2, ArrowLeft, Volume2, Sparkles } from "lucide-react";
import Link from "next/link";
import { playOrderPlacedSound, playStatusUpdateSound, playDeliveredSound } from "@/lib/utils/sound";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  locationName: string;
  totalAmount: number;
  status: "received" | "in_kitchen" | "delivering" | "delivered" | "cancelled";
  specialInstructions: string | null;
  createdAt: string;
}

export default function OrderTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  const fetchOrder = async (isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error("Order not found");
      }
      const data = await res.json();
      setOrder(data.order);
      setItems(data.items || []);

      // Check status change & play corresponding synthesized sound chime
      if (prevStatus !== null && prevStatus !== data.order.status) {
        if (data.order.status === "in_kitchen") {
          playStatusUpdateSound();
          toast.success("Order status updated: In Kitchen", { description: "Executive chef has begun preparing your meal." });
        } else if (data.order.status === "delivering") {
          playStatusUpdateSound();
          toast.success("Order status updated: Out for Delivery", { description: "Room service attendant is on the way." });
        } else if (data.order.status === "delivered") {
          playDeliveredSound();
          toast.success("Order Delivered!", { description: "Enjoy your meal in " + data.order.locationName });
        }
      } else if (prevStatus === null) {
        // Initial load sound
        if (data.order.status === "received") playOrderPlacedSound();
      }

      setPrevStatus(data.order.status);
    } catch (err: any) {
      setError(err?.message || "Could not retrieve order details");
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto poll status every 6 seconds
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [orderId]);

  // Handler to manually advance status for demonstration/testing
  const handleAdvanceStatus = async () => {
    if (!order) return;
    const statusFlow: Record<string, "received" | "in_kitchen" | "delivering" | "delivered"> = {
      received: "in_kitchen",
      in_kitchen: "delivering",
      delivering: "delivered",
      delivered: "received",
    };

    const nextStatus = statusFlow[order.status] || "received";

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        if (nextStatus === "in_kitchen" || nextStatus === "delivering") {
          playStatusUpdateSound();
        } else if (nextStatus === "delivered") {
          playDeliveredSound();
        } else {
          playOrderPlacedSound();
        }
        toast.info(`Updated order status to "${nextStatus.replace("_", " ")}"`, {
          description: "Sound notification triggered.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statusSteps = [
    {
      key: "received",
      label: "Order Received",
      subtext: "Kitchen staff notified.",
      icon: Bell,
    },
    {
      key: "in_kitchen",
      label: "In Kitchen",
      subtext: "Chefs are actively preparing your meal.",
      icon: Utensils,
    },
    {
      key: "delivering",
      label: "Out for Delivery",
      subtext: "Room service is on its way to your room.",
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Delivered",
      subtext: "Bon Appétit! Delivered to your room.",
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "received":
        return 0;
      case "in_kitchen":
        return 1;
      case "delivering":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center space-y-4 font-sans text-stone-900">
        <Loader2 className="w-10 h-10 animate-spin text-[#183B32]" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Retrieving Real-Time Order Status...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-[#E5E3DB] shadow-md max-w-sm w-full space-y-4">
          <Utensils className="w-12 h-12 text-[#183B32] mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">Order Not Found</h2>
          <p className="text-xs text-stone-500">{error || "Could not find an active room service order for this ID."}</p>
          <Link
            href="/menu"
            className="inline-block px-5 py-2.5 rounded-full bg-[#183B32] text-white text-xs font-semibold shadow-sm"
          >
            Return to Room Menu
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);
  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#94A3B8]/20 backdrop-blur-md flex items-center justify-center p-4 font-sans text-stone-900">
      {/* Background Dim Page Container */}
      <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs pointer-events-none" />

      {/* Real-Time Tracking Modal (Matching Inspiration Image) */}
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E5E3DB] relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Handle bar */}
        <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto -mt-2 mb-2" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#E5E3DB] pb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#9E6E4D]">
              REAL-TIME TRACKING
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
              Order #{order.id}
            </h1>
          </div>
          <Link
            href="/menu"
            className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Close tracker"
          >
            <X className="w-5 h-5" />
          </Link>
        </div>

        {/* Timeline Progress List */}
        <div className="relative pl-3 space-y-6">
          {/* Vertical connecting line */}
          <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-stone-200 -z-0" />

          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4 relative z-10">
                {/* Step Circle Badge */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#183B32] border-[#183B32] text-white shadow-sm"
                      : "bg-[#F7F6F2] border-stone-200 text-stone-400"
                  } ${isCurrent ? "ring-4 ring-[#183B32]/20 scale-105" : ""}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>

                {/* Step Content */}
                <div className="space-y-0.5 pt-1">
                  <h3
                    className={`text-sm font-bold leading-tight ${
                      isCompleted ? "text-stone-900" : "text-stone-400"
                    }`}
                  >
                    {step.label}
                  </h3>
                  {isCompleted && (
                    <p className="text-xs text-[#9E6E4D] font-medium leading-normal">
                      {step.subtext}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Details Container Card */}
        <div className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#E5E3DB] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-semibold">Delivery Target:</span>
            <span className="font-bold text-stone-900">{order.locationName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-semibold">Items Ordered:</span>
            <span className="font-bold text-stone-900">{totalQuantity} {totalQuantity === 1 ? "item" : "items"} ({formatPrice(order.totalAmount)})</span>
          </div>

          {/* Items breakdown list */}
          {items.length > 0 && (
            <div className="pt-2 border-t border-[#E5E3DB] space-y-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>{item.quantity}x {item.title}</span>
                  <span className="font-mono text-stone-500">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Audio & Status Controls */}
        <div className="space-y-2">
          <button
            onClick={handleAdvanceStatus}
            className="w-full py-3.5 rounded-full bg-[#183B32] text-white font-semibold text-xs hover:bg-[#112D26] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Retract & Close Tracker</span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => playOrderPlacedSound()}
              className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 font-medium"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#183B32]" />
              <span>Test Audio Chime</span>
            </button>

            <button
              onClick={handleAdvanceStatus}
              className="text-[11px] text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Simulate Next Status</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
