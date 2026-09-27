"use client";

import Link from "next/link";

interface OrderSummaryProps {
  totalAmount: number;
  formatPrice: (val: number) => string;
}

export function OrderSummary({
  totalAmount,
  formatPrice,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3DB] shadow-xs space-y-5 flex flex-col justify-between font-sans">
      <div className="space-y-4">
        <h2 className="text-base font-bold text-stone-900 tracking-tight border-b border-[#E5E3DB] pb-4">
          Receipt Summary
        </h2>

        <div className="space-y-2.5 text-xs text-stone-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-stone-900">
              {formatPrice(totalAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Room Service Delivery</span>
            <span className="font-mono font-semibold text-emerald-700">
              Complimentary
            </span>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-stone-900 pt-3 border-t border-[#E5E3DB]">
            <span>Total Paid</span>
            <span className="font-mono text-base text-[#183B32]">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#E5E3DB]">
        <Link
          href="/menu"
          className="w-full py-3.5 rounded-full bg-[#183B32] text-white font-semibold text-xs hover:bg-[#112D26] transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span>Back to Menu</span>
        </Link>
      </div>
    </div>
  );
}
