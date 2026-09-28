"use client";

import { useEffect, useState } from "react";
import {
  Order,
  DashboardHeader,
  MetricsGrid,
  RecentActivity,
} from "@/components/dashboard";

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

  // Metrics calculation
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

  return (
    <div className="max-w-6xl mx-auto space-y-10 font-sans pb-12">
      <DashboardHeader onRefresh={() => fetchOrders()} />

      <MetricsGrid
        todayRevenue={todayRevenue}
        totalRevenue={totalRevenue}
        todayOrdersCount={todayOrders.length}
        activeOrdersCount={activeOrders.length}
        prepOrdersCount={prepOrders.length}
        deliveredOrdersCount={deliveredOrders.length}
        totalOrdersCount={orders.length}
      />

      <RecentActivity orders={orders} loading={loading} />
    </div>
  );
}
