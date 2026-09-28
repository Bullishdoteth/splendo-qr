"use client";

import { use, useEffect, useState } from "react";
import { Utensils, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  playOrderPlacedSound,
  playStatusUpdateSound,
  playDeliveredSound,
} from "@/lib/utils/sound";
import { toast } from "sonner";
import {
  OrderHeader,
  OrderBanner,
  OrderProgress,
  OrderItemsList,
  OrderSummary,
} from "@/components/order-page";

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

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
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

      if (prevStatus !== null && prevStatus !== data.order.status) {
        if (data.order.status === "in_kitchen") {
          playStatusUpdateSound();
          toast.success("Order status updated: In Kitchen", {
            description: "Executive chef has begun preparing your meal.",
          });
        } else if (data.order.status === "delivering") {
          playStatusUpdateSound();
          toast.success("Order status updated: Out for Delivery", {
            description: "Room service attendant is on the way.",
          });
        } else if (data.order.status === "delivered") {
          playDeliveredSound();
          toast.success("Order Delivered!", {
            description: "Enjoy your meal in " + data.order.locationName,
          });
        }
      } else if (prevStatus === null) {
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

    const interval = setInterval(() => {
      fetchOrder(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [orderId]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center space-y-4 font-sans text-stone-900">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Retrieving Real-Time Order Details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-[#E5E3DB] shadow-sm max-w-md w-full space-y-4">
          <Utensils className="w-12 h-12 text-black mx-auto" />
          <h2 className="text-xl font-bold text-stone-900">Order Not Found</h2>
          <p className="text-xs text-stone-500">
            {error || "Could not find an active room service order for this ID."}
          </p>
          <Link
            href="/menu"
            className="inline-block px-6 py-3 rounded-full bg-black text-white text-xs font-semibold shadow-sm hover:bg-neutral-800 transition-colors"
          >
            Return to Room Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900 flex flex-col pb-16">
      {/* Reusable Header Bar */}
      <OrderHeader />

      {/* Main Page Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Reusable Order Banner */}
        <OrderBanner
          orderId={order.id}
          locationName={order.locationName}
          createdAt={order.createdAt}
          status={order.status}
          onRefresh={() => fetchOrder()}
        />

        {/* Reusable Order Progress */}
        <OrderProgress status={order.status} />

        {/* Reusable Grid: Order Items & Receipt Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrderItemsList
              items={items}
              totalAmount={order.totalAmount}
              specialInstructions={order.specialInstructions}
              formatPrice={formatPrice}
            />
          </div>

          <div>
            <OrderSummary
              totalAmount={order.totalAmount}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
