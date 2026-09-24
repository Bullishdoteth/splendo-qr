"use client";

import { use, useEffect, useState } from "react";
import { Clock, Plus, Minus, Search, Utensils, CheckCircle, Loader2, ShoppingBag, X, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { playOrderPlacedSound } from "@/lib/utils/sound";

interface MenuItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string | null;
  price: number;
  prepTime: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface CategoryWithItems {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
}

interface LocationInfo {
  id: string;
  name: string;
  slug: string;
  category: string;
  floor: string | null;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function GuestMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart & Drawer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const res = await fetch(`/api/menu/${slug}`);
        if (!res.ok) {
          throw new Error("Location not found or offline.");
        }
        const data = await res.json();
        setLocation(data.location);
        setCategories(data.categories);
      } catch (err: any) {
        setError(err?.message || "Unable to load room menu");
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [slug]);


  const updateQuantity = (dish: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === dish.id);
      if (!existing) {
        if (delta > 0) {
          toast.success(`Added ${dish.title} to order`, {
            description: `${formatPrice(dish.price)} • In-room delivery`,
          });
          return [...prev, { item: dish, quantity: 1 }];
        }
        return prev;
      }
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        toast.info(`Removed ${dish.title} from order`);
        return prev.filter((c) => c.item.id !== dish.id);
      }
      if (delta > 0) {
        toast.success(`Updated ${dish.title} (${newQty})`);
      }
      return prev.map((c) => (c.item.id === dish.id ? { ...c, quantity: newQty } : c));
    });
  };

  const getItemQuantity = (dishId: string) => {
    return cart.find((c) => c.item.id === dishId)?.quantity || 0;
  };

  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSendOrder = async () => {
    if (cart.length === 0 || !location) return;

    setSubmittingOrder(true);
    try {
      const payload = {
        locationId: location.id,
        locationName: location.name,
        totalAmount: totalCartPrice,
        specialInstructions,
        items: cart.map((c) => ({
          title: c.item.title,
          price: c.item.price,
          quantity: c.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.order) {
        // Play synthesized Web Audio chime sound
        playOrderPlacedSound();

        setPlacedOrderId(data.order.id);
        setOrderConfirmed(true);
        setCart([]);
        toast.success(`Order #${data.order.id} sent directly to kitchen!`, {
          description: `Delivering to ${location.name}`,
        });
      } else {
        alert(data.error || "Failed to submit order");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending order");
    } finally {
      setSubmittingOrder(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center space-y-4 font-sans text-stone-900">
        <Loader2 className="w-10 h-10 animate-spin text-[#183B32]" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Loading Splendo Room Menu...
        </p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-[#E5E3DB] shadow-md max-w-sm w-full space-y-4">
          <Utensils className="w-12 h-12 text-[#183B32] mx-auto" />
          <h2 className="text-xl font-serif font-bold text-stone-900">Ordering Point Inactive</h2>
          <p className="text-xs text-stone-500">{error || "Please scan a valid room QR code to view in-room dining."}</p>
          <Link
            href="/admin/overview"
            className="inline-block px-5 py-2.5 rounded-full bg-[#183B32] text-white text-xs font-semibold shadow-sm"
          >
            Staff Portal Overview
          </Link>
        </div>
      </div>
    );
  }

  // Filter items across categories
  const allItems = categories.flatMap((c) => c.items);
  const filteredCategories = categories.map((cat) => {
    const matchingItems = cat.items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = activeCategory === "all" || activeCategory === cat.id;
      return matchesSearch && matchesCat;
    });
    return { ...cat, items: matchingItems };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-stone-900 font-sans pb-32">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Luxury Green Room Service Card Header */}
        <div className="bg-[#183B32] text-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle decorative glow overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2B5247] border border-[#396357] flex items-center justify-center font-serif text-lg font-bold text-white shadow-inner">
                S
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-emerald-200/80">
                  ROOM SERVICE DELIVERY
                </p>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white mt-0.5">
                  Splendo Hotel & Suites
                </h1>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#2B5247]/70 border border-[#396357] flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-emerald-200" />
            </div>
          </div>

          {/* Card Bottom Row Info */}
          <div className="flex items-end justify-between pt-4 border-t border-[#2B5247]">
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-emerald-200/70">
                DELIVERING TO
              </p>
              <p className="text-xl sm:text-2xl font-bold font-serif text-white mt-0.5">
                {location.name}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-emerald-200/70">
                SERVICE HOURS
              </p>
              <p className="text-xs font-semibold text-white mt-1">
                8:00 AM – 10:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E5E3DB] rounded-full text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 shadow-sm transition-all"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeCategory === "all"
                ? "bg-[#183B32] text-white shadow-md"
                : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
            }`}
          >
            Popular ({allItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                activeCategory === cat.id
                  ? "bg-[#183B32] text-white shadow-md"
                  : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
              }`}
            >
              {cat.name} ({cat.items.length})
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E3DB] space-y-2">
            <p className="text-stone-500 text-xs font-medium">No dishes match your search.</p>
          </div>
        ) : (
          <div className="space-y-8 pt-2">
            {filteredCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                {activeCategory === "all" && (
                  <h2 className="text-lg font-serif font-bold text-stone-900 px-1">
                    {category.name}
                  </h2>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {category.items.map((dish) => {
                    const qty = getItemQuantity(dish.id);
                    return (
                      <div
                        key={dish.id}
                        className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E5E3DB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:border-stone-400 transition-all group"
                      >
                        {/* Dish Thumbnail */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100 relative">
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <Utensils className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Dish Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h3 className="text-base font-serif font-bold text-stone-900 leading-snug truncate">
                            {dish.title}
                          </h3>

                          {dish.subtitle && (
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">
                              {dish.subtitle}
                            </p>
                          )}

                          <div className="flex items-center gap-3 pt-1">
                            <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                              {formatPrice(dish.price)}
                            </span>

                            <span className="flex items-center gap-1 text-[11px] text-stone-400 font-medium">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {dish.prepTime}
                            </span>
                          </div>
                        </div>

                        {/* Add Button / Quantity controls */}
                        <div className="shrink-0">
                          {qty === 0 ? (
                            <button
                              onClick={() => updateQuantity(dish, 1)}
                              className="px-4 py-2 rounded-full bg-[#183B32] text-white text-xs font-semibold hover:bg-[#112D26] transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <div className="flex items-center border border-[#183B32] rounded-full bg-[#183B32]/5 overflow-hidden p-0.5">
                              <button
                                onClick={() => updateQuantity(dish, -1)}
                                className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-stone-900 font-bold flex items-center justify-center text-xs shadow-xs transition-colors"
                              >
                                -
                              </button>
                              <span className="px-2.5 font-mono text-xs font-bold text-[#183B32]">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(dish, 1)}
                                className="w-7 h-7 rounded-full bg-[#183B32] text-white hover:bg-[#112D26] font-bold flex items-center justify-center text-xs shadow-xs transition-colors"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom View Order Bar */}
      {totalCartItems > 0 && !isDrawerOpen && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-[#183B32] text-white p-4 rounded-full shadow-2xl flex items-center justify-between hover:bg-[#112D26] transition-all font-sans border border-[#2B5247] group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#2B5247] text-white text-xs font-mono font-bold flex items-center justify-center">
                {totalCartItems}
              </span>
              <div className="text-left">
                <p className="text-xs font-semibold tracking-wide">View Room Order</p>
                <p className="text-[10px] text-emerald-200/80">Tap to review & send to kitchen</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{formatPrice(totalCartPrice)}</span>
              <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* Slide-Up Bottom Order Drawer (Inspired by Shadcn / Vaul Drawer) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
          <div
            className="bg-white rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E5E3DB] font-sans max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 relative"
          >
            {/* Drawer Handle */}
            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto -mt-2 mb-2" />

            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[#E5E3DB] pb-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-400">
                  IN-ROOM DINING BASKET
                </p>
                <h3 className="text-xl font-serif font-bold text-stone-900">Your Order Summary</h3>
                <p className="text-xs text-stone-500 mt-0.5">Delivering to <strong className="text-stone-900">{location.name}</strong></p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-[#E5E3DB]">
              {cart.map(({ item, quantity }) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-serif font-bold text-stone-900 truncate">{item.title}</p>
                    <p className="text-xs text-stone-500 font-mono">
                      {formatPrice(item.price)} × {quantity}
                    </p>
                  </div>

                  <div className="flex items-center border border-[#183B32] rounded-full bg-[#183B32]/5 p-0.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-stone-900 font-bold flex items-center justify-center text-xs shadow-xs"
                    >
                      -
                    </button>
                    <span className="px-2.5 font-mono text-xs font-bold text-[#183B32]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item, 1)}
                      className="w-7 h-7 rounded-full bg-[#183B32] text-white hover:bg-[#112D26] font-bold flex items-center justify-center text-xs shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions Input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                <span>Special Instructions for Kitchen</span>
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra cutlery, sauce on the side, no onions..."
                className="w-full px-4 py-2.5 bg-[#F7F6F2] border border-[#E5E3DB] rounded-2xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
              />
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-[#E5E3DB] space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-stone-900">{formatPrice(totalCartPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Room Service Delivery Fee</span>
                <span className="font-mono font-semibold text-emerald-700">Complimentary</span>
              </div>
              <div className="flex items-center justify-between text-base font-serif font-bold text-stone-900 pt-2 border-t border-[#E5E3DB]">
                <span>Total Amount</span>
                <span className="font-mono text-lg text-[#183B32]">{formatPrice(totalCartPrice)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              onClick={handleSendOrder}
              disabled={submittingOrder || cart.length === 0}
              className="w-full py-4 rounded-full bg-[#183B32] text-white font-semibold text-sm hover:bg-[#112D26] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending to Kitchen...</span>
                </>
              ) : (
                <span>Send Order to Kitchen ({formatPrice(totalCartPrice)})</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderConfirmed && placedOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center space-y-5 shadow-2xl border border-[#E5E3DB] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#183B32] flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-stone-900">Order #{placedOrderId} Received!</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your room service order has been transmitted directly to our executive kitchen for delivery to <strong className="text-stone-900">{location.name}</strong>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/order/${placedOrderId}`}
                className="w-full py-3.5 rounded-full bg-[#183B32] text-white font-semibold text-xs hover:bg-[#112D26] transition-colors shadow-sm flex items-center justify-center gap-2 block"
              >
                <span>Track Order Status Live</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => {
                  setOrderConfirmed(false);
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2.5 rounded-full border border-[#E5E3DB] bg-white text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

