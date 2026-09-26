"use client";

import { X, Trash2, Loader2 } from "lucide-react";
import { CartItem, MenuItem, formatPrice } from "./types";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  locationName: string;
  updateQuantity: (dish: MenuItem, delta: number) => void;
  specialInstructions: string;
  setSpecialInstructions: (val: string) => void;
  submittingOrder: boolean;
  handleSendOrder: () => void;
  totalCartPrice: number;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  locationName,
  updateQuantity,
  specialInstructions,
  setSpecialInstructions,
  submittingOrder,
  handleSendOrder,
  totalCartPrice,
}: CartDrawerProps) {
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      showSwipeHandle
    >
      <DrawerContent className="max-w-md h-[60vh] mx-auto p-5 sm:p-6 space-y-5 font-sans overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-[#E5E3DB] pb-3">
          <div>
            <DrawerTitle className="text-lg font-bold text-stone-900">Your Order</DrawerTitle>
            <DrawerDescription className="text-xs text-stone-500 mt-0.5">
              Delivering to{" "}
              <strong className="text-stone-900">{locationName}</strong>
            </DrawerDescription>
          </div>
          <DrawerClose
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </DrawerClose>
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
          <label className="text-xs font-semibold text-stone-700 pb-10">
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
      </DrawerContent>
    </Drawer>
  );
}

