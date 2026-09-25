"use client";

import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { playOrderPlacedSound } from "@/lib/utils/sound";
import { SplashScreen } from "@/components/shared/splash";
import {
  MenuItem,
  CategoryWithItems,
  LocationInfo,
  CartItem,
  formatPrice,
  MenuHeader,
  MenuSearch,
  CategoryNav,
  MenuList,
  CartBar,
  CartDrawer,
  OrderConfirmationModal,
} from "@/components/guest-menu";

export type { MenuItem, CategoryWithItems, LocationInfo, CartItem };

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

      {/* Contextual Top Header */}
      <MenuHeader location={location} />

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-10 space-y-4">
        {/* Search Header */}
        <MenuSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Category Navigation Bar */}
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Menu Items List */}
        <MenuList
          displaySections={displaySections}
          getItemQuantity={getItemQuantity}
          updateQuantity={updateQuantity}
          onClearSearchAndShowAll={() => {
            setSearchQuery("");
            setActiveCategory("all");
          }}
          menuListRef={menuListRef}
        />
      </main>

      {/* Fixed Bottom Cart Bar */}
      <CartBar
        totalCartItems={totalCartItems}
        totalCartPrice={totalCartPrice}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Bottom Sheet Drawer for Cart & Checkout */}
      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cart={cart}
        locationName={location.name}
        updateQuantity={updateQuantity}
        specialInstructions={specialInstructions}
        setSpecialInstructions={setSpecialInstructions}
        submittingOrder={submittingOrder}
        handleSendOrder={handleSendOrder}
        totalCartPrice={totalCartPrice}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={orderConfirmed}
        placedOrderId={placedOrderId}
        locationName={location.name}
        onClose={() => {
          setOrderConfirmed(false);
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
}
