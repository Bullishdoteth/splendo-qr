"use client";

import { ShoppingBag, FileText } from "lucide-react";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface OrderItemsListProps {
  items: OrderItem[];
  totalAmount: number;
  specialInstructions: string | null;
  formatPrice: (val: number) => string;
}

export function OrderItemsList({
  items,
  totalAmount,
  specialInstructions,
  formatPrice,
}: OrderItemsListProps) {
  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3DB] shadow-xs space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-[#E5E3DB] pb-4">
        <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#183B32]" />
          <span>Items Ordered ({totalQuantity})</span>
        </h2>
        <span className="text-xs font-mono font-bold text-[#183B32]">
          {formatPrice(totalAmount)}
        </span>
      </div>

      <div className="divide-y divide-[#E5E3DB]">
        {items.map((item) => (
          <div
            key={item.id}
            className="py-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-7 h-7 rounded-full bg-[#183B32]/10 text-[#183B32] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                {item.quantity}×
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">
                  {item.title}
                </p>
                <p className="text-xs text-stone-500 font-mono">
                  {formatPrice(item.price)} each
                </p>
              </div>
            </div>

            <span className="font-mono text-sm font-bold text-stone-900 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {specialInstructions && (
        <div className="pt-4 border-t border-[#E5E3DB] space-y-1.5">
          <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#183B32]" />
            <span>Special Instructions</span>
          </span>
          <p className="text-xs text-stone-700 italic bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E5E3DB] leading-relaxed">
            "{specialInstructions}"
          </p>
        </div>
      )}
    </div>
  );
}
