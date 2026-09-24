import { ArrowUpRight, TrendingUp, ShoppingBag, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function AdminOverviewPage() {
  const recentOrders = [
    {
      id: "ORD-1042",
      room: "Suite 402",
      guest: "Alexander Wright",
      items: "2x Wagyu Burger, 1x Truffle Fries",
      total: "₦94,000",
      status: "Preparing",
      statusStyle: "bg-amber-100/80 text-amber-900 border-amber-200/80",
    },
    {
      id: "ORD-1041",
      room: "Room 215",
      guest: "Elena Rostova",
      items: "1x Club Sandwich, 1x Fresh Orange Juice",
      total: "₦38,000",
      status: "In Transit",
      statusStyle: "bg-blue-100/80 text-blue-900 border-blue-200/80",
    },
    {
      id: "ORD-1040",
      room: "Penthouse 01",
      guest: "Marcus Vance",
      items: "1x Champagne Breakfast Set",
      total: "₦185,000",
      status: "Delivered",
      statusStyle: "bg-stone-100 text-stone-700 border-stone-200",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2E2DC]">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-stone-500">
            Staff Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1 tracking-tight">
            Dashboard Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
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
          <p className="text-2xl font-bold text-stone-900">₦2,480,000</p>
          <p className="text-xs text-stone-500 font-medium">
            <span className="text-emerald-700 font-semibold">+14.2%</span> vs yesterday
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900">8</p>
          <p className="text-xs text-stone-500 font-medium">3 requiring preparation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Avg. Delivery</span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900">18 min</p>
          <p className="text-xs text-stone-500 font-medium">Within 25 min target</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Room Occupancy</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <p className="text-2xl font-bold text-stone-900">82%</p>
          <p className="text-xs text-stone-500 font-medium">28 of 34 suites occupied</p>
        </div>
      </div>

      {/* Recent Activity Table Section */}
      <div className="bg-white rounded-2xl border border-[#E2E2DC] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-[#E2E2DC] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Recent Room Service Activity</h2>
            <p className="text-xs text-stone-500 mt-0.5">Real-time status of current guest requests.</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-stone-900 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#E2E2DC]">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-5 flex items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900 text-sm">{order.room}</span>
                  <span className="text-xs text-stone-400 font-mono">• {order.id}</span>
                </div>
                <p className="text-xs text-stone-600 truncate">{order.items}</p>
                <p className="text-[11px] text-stone-400">Guest: {order.guest}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="font-mono text-sm font-semibold text-stone-900">{order.total}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${order.statusStyle}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
