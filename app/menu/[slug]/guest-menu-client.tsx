"use client";

import { useState, useMemo, useRef } from "react";
import {
  Clock,
  Plus,
  Search,
  Utensils,
  CheckCircle,
  Loader2,
  X,
  ChevronRight,
  Trash2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { playOrderPlacedSound } from "@/lib/utils/sound";
import { SplashScreen } from "@/components/shared/splash";

export interface MenuItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string | null;
  price: number;
  prepTime: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface CategoryWithItems {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
}

export interface LocationInfo {
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

interface GuestMenuClientProps {
  initialLocation: LocationInfo;
  initialCategories: CategoryWithItems[];
}

export default function GuestMenuClient({
  initialLocation,
  initialCategories,
}: GuestMenuClientProps) {
  const [location] = useState<LocationInfo>(initialLocation);
  const [categories] = useState<CategoryWithItems[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string>("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const menuListRef = useRef<HTMLDivElement | null>(null);

  // Cart & Drawer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  // Curated 6–12 Popular Items
  const popularItems = useMemo(() => {
    const allItems = categories.flatMap((c) => c.items);
    const featured = allItems.filter((i) => i.isFeatured && i.isAvailable);

    if (featured.length >= 6 && featured.length <= 12) {
      return featured;
    }

    const selected: MenuItem[] = [...featured];
    const selectedIds = new Set(selected.map((i) => i.id));

    for (const cat of categories) {
      for (const item of cat.items) {
        if (!selectedIds.has(item.id) && item.isAvailable) {
          selected.push(item);
          selectedIds.add(item.id);
          if (selected.length >= 10) break;
        }
      }
      if (selected.length >= 10) break;
    }
    return selected.slice(0, 10);
  }, [categories]);

  // Cart operations
  const updateQuantity = (dish: MenuItem, delta: number) => {
    const existing = cart.find((c) => c.item.id === dish.id);
    const currentQty = existing?.quantity || 0;
    const newQty = currentQty + delta;

    if (currentQty === 0 && delta > 0) {
      toast.success(`Added ${dish.title} to order`, {
        description: `${formatPrice(dish.price)} • In-room delivery`,
      });
    } else if (newQty <= 0 && currentQty > 0) {
      toast.info(`Removed ${dish.title} from order`);
    }

    setCart((prev) => {
      const itemInPrev = prev.find((c) => c.item.id === dish.id);
      if (!itemInPrev) {
        if (delta > 0) return [...prev, { item: dish, quantity: 1 }];
        return prev;
      }
      const updatedQty = itemInPrev.quantity + delta;
      if (updatedQty <= 0) {
        return prev.filter((c) => c.item.id !== dish.id);
      }
      return prev.map((c) =>
        c.item.id === dish.id ? { ...c, quantity: updatedQty } : c
      );
    });
  };

  const getItemQuantity = (dishId: string) => {
    return cart.find((c) => c.item.id === dishId)?.quantity || 0;
  };

  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cart.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0
  );

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
        specialInstructions,
        items: cart.map((c) => ({
          menuItemId: c.item.id,
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
      if (!res.ok || data.error) {
        toast.error("Order submission failed", {
          description: data.error || "Please review your cart and try again.",
        });
        return;
      }

      if (data.order) {
        playOrderPlacedSound();
        setPlacedOrderId(data.order.id);
        setOrderConfirmed(true);
        setCart([]);
        toast.success(`Order #${data.order.id} sent directly to kitchen!`, {
          description: `Delivering to ${location.name}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error", {
        description: "Could not reach room service server. Please try again.",
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filter Categories & Items based on search and active tab
  const displaySections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      const matchedCategories = categories
        .map((cat) => {
          const matchingItems = cat.items.filter((item) => {
            const matchesSearch =
              item.title.toLowerCase().includes(query) ||
              (item.subtitle && item.subtitle.toLowerCase().includes(query));
            const matchesCat =
              activeCategory === "popular" ||
              activeCategory === "all" ||
              activeCategory === cat.id;
            return matchesSearch && matchesCat && item.isAvailable;
          });
          return { ...cat, items: matchingItems };
        })
        .filter((cat) => cat.items.length > 0);

      return matchedCategories;
    }

    if (activeCategory === "popular") {
      return [
        {
          id: "popular",
          name: "Popular",
          description: "Curated guest favorites and chef recommendations",
          items: popularItems,
        },
      ];
    }

    if (activeCategory === "all") {
      return [
        {
          id: "popular",
          name: "Popular",
          description: "Curated guest favorites and chef recommendations",
          items: popularItems,
        },
        ...categories.filter((cat) => cat.items.length > 0),
      ];
    }

    const singleCat = categories.find((c) => c.id === activeCategory);
    return singleCat ? [singleCat] : [];
  }, [searchQuery, activeCategory, categories, popularItems]);

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
    if (menuListRef.current) {
      const rect = menuListRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - 120;
      window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans pb-36">
      <SplashScreen />
      {/* Compact Contextual Top Header */}
      <header className="bg-white border-b border-[#E5E3DB] sticky top-0 z-30 shadow-xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#183B32] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Utensils className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-stone-900 leading-tight truncate">
                Splendo Hotel & Suites
              </h1>
              <p className="text-xs text-stone-500 font-medium truncate flex items-center gap-1">
                <span>{location.name}</span>
                <span>·</span>
                <span>Room Service</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-[#183B32]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open until 10:00 PM</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Search Header ("What would you like?") */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            What would you like?
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search food & drinks..."
              className="w-full pl-10 pr-9 py-3 bg-white border border-[#E5E3DB] rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Bar (Sticky Horizontal Chips) */}
        <div className="sticky top-[57px] z-20 bg-white backdrop-blur-md py-2 -mx-4 px-4 border-b border-[#E5E3DB]/60">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none snap-x py-0.5">
            <button
              onClick={() => handleCategorySelect("popular")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 snap-start flex items-center gap-1.5 ${
                activeCategory === "popular"
                  ? "bg-[#183B32] text-white shadow-xs"
                  : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Popular</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 snap-start ${
                  activeCategory === cat.id
                    ? "bg-[#183B32] text-white shadow-xs"
                    : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
                }`}
              >
                {cat.name}
              </button>
            ))}

            <button
              onClick={() => handleCategorySelect("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 snap-start ${
                activeCategory === "all"
                  ? "bg-[#183B32] text-white shadow-xs"
                  : "bg-white text-stone-700 border border-[#E5E3DB] hover:bg-stone-50"
              }`}
            >
              All Items
            </button>
          </div>
        </div>

        {/* Menu Items List */}
        <div ref={menuListRef} className="space-y-6 pt-1">
          {displaySections.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-[#E5E3DB] space-y-2">
              <p className="text-stone-600 text-xs font-semibold">
                No dishes match your search.
              </p>
              <p className="text-stone-400 text-[11px]">
                Try searching for another dish or clear filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 px-4 py-2 bg-[#183B32] text-white text-xs font-semibold rounded-full hover:bg-[#112D26]"
              >
                View All Menu Items
              </button>
            </div>
          ) : (
            displaySections.map((section) => (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
                    {section.id === "popular" && (
                      <Sparkles className="w-4 h-4 text-[#183B32]" />
                    )}
                    <span>{section.name}</span>
                  </h3>
                  {section.items.length > 0 && (
                    <span className="text-[11px] font-medium text-stone-400">
                      {section.items.length}{" "}
                      {section.items.length === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {section.items.map((dish) => {
                    const qty = getItemQuantity(dish.id);
                    const isPopularItem = section.id === "popular";

                    return (
                      <div
                        key={dish.id}
                        className={`bg-white p-3.5 rounded-2xl border border-[#E5E3DB] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-start gap-3.5 transition-all ${
                          isPopularItem ? "ring-1 ring-[#183B32]/10" : ""
                        }`}
                      >
                        {/* Optional Image Thumbnail - ONLY rendered if imageUrl exists */}
                        {dish.imageUrl ? (
                          <div
                            className={`rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100 relative ${
                              isPopularItem
                                ? "w-22 h-22 sm:w-24 sm:h-24"
                                : "w-20 h-20 sm:w-22 sm:h-22"
                            }`}
                          >
                            <img
                              src={dish.imageUrl}
                              alt={dish.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : null}

                        {/* Text Details & Controls */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                              {dish.title}
                            </h4>
                            {dish.subtitle && (
                              <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-snug font-sans">
                                {dish.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-sm sm:text-base">
                                {formatPrice(dish.price)}
                              </span>
                              {dish.prepTime && (
                                <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  {dish.prepTime}
                                </span>
                              )}
                            </div>

                            {/* Inline Quantity Control */}
                            <div>
                              {qty === 0 ? (
                                <button
                                  onClick={() => updateQuantity(dish, 1)}
                                  className="h-9 px-3.5 bg-[#183B32] text-white text-xs font-semibold rounded-full hover:bg-[#112D26] active:scale-95 transition-all flex items-center gap-1 shadow-xs shrink-0"
                                  aria-label={`Add ${dish.title}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </button>
                              ) : (
                                <div className="flex items-center bg-[#183B32]/10 border border-[#183B32]/30 rounded-full p-0.5 shadow-xs shrink-0">
                                  <button
                                    onClick={() => updateQuantity(dish, -1)}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-stone-900 hover:bg-stone-100 font-bold flex items-center justify-center text-xs active:scale-90 transition-transform shadow-xs"
                                    aria-label="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center font-mono text-xs font-bold text-[#183B32]">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(dish, 1)}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#183B32] text-white hover:bg-[#112D26] font-bold flex items-center justify-center text-xs active:scale-90 transition-transform shadow-xs"
                                    aria-label="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Fixed Bottom Cart Bar */}
      {totalCartItems > 0 && !isDrawerOpen && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-[#183B32] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center justify-between hover:bg-[#112D26] active:scale-[0.98] transition-all border border-[#2B5247]"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center border border-emerald-500/30">
                {totalCartItems}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold tracking-wide leading-none">
                  View order
                </p>
                <p className="text-[10px] text-emerald-200/80 leading-tight mt-0.5">
                  {totalCartItems} {totalCartItems === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">
                {formatPrice(totalCartPrice)}
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-200" />
            </div>
          </button>
        </div>
      )}

      {/* Bottom Sheet Drawer for Cart & Checkout */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[28px] sm:rounded-[28px] max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-[#E5E3DB] font-sans max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 relative">
            {/* Handle Bar */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto -mt-1 mb-1" />

            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-[#E5E3DB] pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Your Order</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Delivering to{" "}
                  <strong className="text-stone-900">{location.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item List */}
            <div className="divide-y divide-[#E5E3DB]">
              {cart.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-bold text-stone-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-stone-500 font-mono">
                      {formatPrice(item.price)} × {quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-[#183B32]/30 rounded-full bg-[#183B32]/5 p-0.5">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-stone-100 text-stone-900 font-bold flex items-center justify-center text-xs shadow-xs"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono text-xs font-bold text-[#183B32]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="w-7 h-7 rounded-full bg-[#183B32] text-white hover:bg-[#112D26] font-bold flex items-center justify-center text-xs shadow-xs"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => updateQuantity(item, -quantity)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-stone-700">
                Special instructions
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Extra cutlery, sauce on the side..."
                className="w-full px-3.5 py-2.5 bg-[#F7F6F2] border border-[#E5E3DB] rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
              />
            </div>

            {/* Pricing Breakdown */}
            <div className="pt-3 border-t border-[#E5E3DB] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-stone-900">
                  {formatPrice(totalCartPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Room Service Delivery</span>
                <span className="font-mono font-semibold text-emerald-700">
                  Complimentary
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-stone-900 pt-2 border-t border-[#E5E3DB]">
                <span>Total</span>
                <span className="font-mono text-lg text-[#183B32]">
                  {formatPrice(totalCartPrice)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleSendOrder}
              disabled={submittingOrder || cart.length === 0}
              className="w-full py-3.5 rounded-full bg-[#183B32] text-white font-semibold text-sm hover:bg-[#112D26] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending to Kitchen...</span>
                </>
              ) : (
                <span>Place Order ({formatPrice(totalCartPrice)})</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderConfirmed && placedOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#E5E3DB] animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#183B32] flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-stone-900">
                Order #{placedOrderId} Placed!
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your room service order has been sent to the executive kitchen
                for delivery to{" "}
                <strong className="text-stone-900">{location.name}</strong>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/order/${placedOrderId}`}
                className="w-full py-3 rounded-full bg-[#183B32] text-white font-semibold text-xs hover:bg-[#112D26] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Track Order Status</span>
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

